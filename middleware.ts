// import { NextRequest, NextResponse } from "next/server";
// import { redirect } from "next/navigation";

// export function middleware(req: NextRequest){

//     const token = req.cookies.get('token')?.value;

//     if(!token){
//         return NextResponse.redirect(new URL('/login', req.url));
//     }

//     // Decode JWT payload without verifying signature to keep middleware edge-compatible.
//     // This lets us read the `role` and `exp` fields for routing. For full verification,
//     // validate the token on server-side endpoints where Node libs can run.
//     let user: { id?: number; email?: string; role?: string; exp?: number } | null = null;
//     try{
//         const parts = token.split('.');
//         if(parts.length !== 3) throw new Error('Invalid token');
//         const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
//         const json = decodeURIComponent(Array.prototype.map.call(atob(base64), (c: string) => '%'+('00'+c.charCodeAt(0).toString(16)).slice(-2)).join(''));
//         user = JSON.parse(json);

//         // check expiry if present
//         if(user && user.exp && Date.now() / 1000 > user.exp){
//             return NextResponse.redirect(new URL('/login', req.url));
//         }
//     } catch (err) {
//         return NextResponse.redirect(new URL('/login', req.url));
//     }

//     const pathname = req.nextUrl.pathname;

//     if(pathname === '/' && token){
//         try{
//             const parts = token.split('.');
//             const payload = JSON.parse(
//                 Buffer.from(parts[1], 'base64').toString()
//             );

//             const role = payload.role;

//             const dashboard = 
//                 role === 'ADMIN'
//                     ? '/dashboard/admin'
//                     : role === 'FACULTY'
//                     ? '/dashboard/faculty'
//                     : '/dashboard/student';
            
//             return NextResponse.redirect(new URL(dashboard, req.url));

//         }
//         catch{
//             return null;
//         }
//     }

//     //Role-based protection
//     if(pathname.startsWith('/dashboard/admin') && user?.role != 'ADMIN'){
//         return NextResponse.redirect(new URL('/', req.url));
//     }

//     if(pathname.startsWith('/dashboard/faculty') && user?.role != 'FACULTY'){
//         return NextResponse.redirect(new URL('/', req.url));
//     }

//     if(pathname.startsWith('/dashboard/student') && user?.role != 'STUDENT'){
//         return NextResponse.redirect(new URL('/', req.url));
//     }

//     return NextResponse.next();

// }

// export const config = {
//     matcher: ['/','/dashboard/:path*'],
// };

//
//
//

import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest){

    const token = req.cookies.get('token')?.value;
    const pathname = req.nextUrl.pathname;

    //🚫 NO TOKEN
    if(!token && pathname.startsWith('/dashboard')){
        return NextResponse.redirect(new URL('/login', req.url));
    }

    if(!token){
        return NextResponse.next();
    }

    let user: { role?: string; exp?: number } | null = null;

    try{
        const parts = token.split('.');
        const payload = JSON.parse(
            Buffer.from(parts[1], "base64").toString()
        );

        //check expiry
        if(payload.exp && Date.now() / 1000 > payload.exp){
            return NextResponse.redirect(new URL('/login', req.url));
        }

        user = payload;

    }
    catch{
        return NextResponse.redirect(new URL('/login', req.url));
    }

    if(pathname === '/'){
        const dashbaord = 
            user?.role === 'ADMIN'
                ? '/dashboard/admin'
                : user?.role === 'FACULTY'
                ? '/dashboard/faculty'
                : '/dashboard/student';
        
        return NextResponse.redirect(new URL(dashbaord, req.url));
    }

    //role-based protection
    if(pathname.startsWith('/dashboard/admin') && user?.role != 'ADMIN'){
        return NextResponse.redirect(new URL('/login', req.url));
    }

    if(pathname.startsWith('/dashboard/faculty') && user?.role != 'FACULTY'){
        return NextResponse.redirect(new URL('/login', req.url));
    }

    if(pathname.startsWith('/dashboard/student') && user?.role != 'STUDENT'){
        return NextResponse.redirect(new URL('/login', req.url));
    }

    return NextResponse.next();

}

export const config = {
    matcher: ['/', '/dashboard/:path*'],
};