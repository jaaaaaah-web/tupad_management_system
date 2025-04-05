import { NextResponse } from 'next/server';
import { connectToDB } from '@/app/lib/utils';
import { Admins } from '@/app/lib/models';
import { cookies } from 'next/headers';

export async function GET(request) {
  try {
    // Get search parameters from URL
    const url = new URL(request.url);
    const q = url.searchParams.get('q') || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    const sort = url.searchParams.get('sort') || 'createdAt';
    const direction = url.searchParams.get('direction') || 'desc';
    const rowCount = parseInt(url.searchParams.get('rowCount') || '10');
    
    // Check authentication using cookies instead of auth() which is causing issues
    const adminId = cookies().get("auth-token")?.value;
    if (!adminId) {
      console.log('API: No valid auth-token found');
      return NextResponse.json({ error: 'Unauthorized', details: 'No valid session' }, { status: 401 });
    }

    // Connect to database with detailed error logging
    try {
      await connectToDB();
      console.log('API: Database connected successfully');
    } catch (dbError) {
      console.error('API: Database connection error:', dbError);
      return NextResponse.json({ 
        error: 'Database connection failed', 
        details: dbError.message 
      }, { status: 500 });
    }

    // Check if Admins model is available
    if (!Admins || !Admins.find) {
      console.error('API: Admins model is not properly initialized');
      return NextResponse.json({ 
        error: 'Database model unavailable', 
        details: 'Admins model is not properly initialized' 
      }, { status: 500 });
    }

    // Verify the requesting admin
    const requestingAdmin = await Admins.findById(adminId);
    if (!requestingAdmin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 401 });
    }

    // Create filter based on search query
    const filter = q ? {
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { name: { $regex: q, $options: 'i' } }
      ]
    } : {};

    // Create sort object
    const sortOption = {};
    sortOption[sort] = direction === 'asc' ? 1 : -1;

    // Calculate pagination
    const ITEMS_PER_PAGE = rowCount;
    const skip = (page - 1) * ITEMS_PER_PAGE;

    // Fetch all admins with search, sort and pagination
    let admins = [];
    let count = 0;
    try {
      // Count total matching documents for pagination
      count = await Admins.countDocuments(filter);
      
      // Execute the main query with all filters and options
      admins = await Admins.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(ITEMS_PER_PAGE);
        
      console.log(`API: Successfully found ${admins.length} admins out of ${count} total`);
    } catch (queryError) {
      console.error('API: Error querying admins:', queryError);
      return NextResponse.json({ 
        error: 'Query failed', 
        details: queryError.message 
      }, { status: 500 });
    }
    
    // Convert to plain objects for serialization and process image paths
    try {
      const serializedAdmins = JSON.parse(JSON.stringify(admins));
      
      // Process each admin record to ensure proper formatting
      const processedAdmins = serializedAdmins.map(admin => {
        // Make sure we have admin._id as admin.id for consistency
        if (admin._id && !admin.id) {
          admin.id = admin._id.toString();
        }
        
        // Process profile image to ensure it's properly formatted
        if (admin.profileImage) {
          // If it's already a data URL format (from our saveProfileImage in production), keep it as is
          if (admin.profileImage.startsWith('dataurl:')) {
            // No changes needed - the ProfileImage component will handle this format
          }
          // If it's already a full URL, leave it as is
          else if (admin.profileImage.startsWith('http')) {
            // Just add cache busting if needed
            admin.profileImage = `${admin.profileImage}${admin.profileImage.includes('?') ? '&' : '?'}t=${Date.now()}`;
          }
          // If it's already a path with /uploads/, just add cache busting
          else if (admin.profileImage.startsWith('/uploads/')) {
            admin.profileImage = `${admin.profileImage}${admin.profileImage.includes('?') ? '&' : '?'}t=${Date.now()}`;
          }
          // Otherwise, assume it's just a filename and prepend the path
          else {
            const imageName = admin.profileImage.split('/').pop();
            admin.profileImage = `/uploads/${imageName || admin.profileImage}?t=${Date.now()}`;
          }
        } else {
          // Default to noavatar.png if no image
          admin.profileImage = `/noavatar.png?t=${Date.now()}`;
        }
        
        return admin;
      });
      
      return NextResponse.json({ 
        admins: processedAdmins, 
        count: count 
      });
    } catch (serializationError) {
      console.error('API: Error serializing admins:', serializationError);
      return NextResponse.json({ 
        error: 'Serialization failed', 
        details: serializationError.message 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('API: Unhandled error in admins endpoint:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch admins', 
      details: error.message 
    }, { status: 500 });
  }
}