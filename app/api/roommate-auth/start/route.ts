export async function GET(req:Request){return Response.redirect(new URL('/login?next=/roommates',req.url),303)}
