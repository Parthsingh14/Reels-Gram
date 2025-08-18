import { dbConnect } from "@/lib/db";
import Video from "@/models/Video";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { IVideo } from "@/models/Video";

export async function GET(){
    try{
        await dbConnect();
        const videos = await Video.find({}).sort({createdAt: -1}).lean();

        if(!videos || videos.length === 0){ 
            return NextResponse.json([], { status: 200 });
        }

        return NextResponse.json(videos);

    } catch(error){
        return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try{
        const session = await getServerSession(authOptions);
        if(!session || !session.user){
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const body: IVideo = await request.json();
        if(!body.title || !body.description || !body.videoUrl || !body.thumbnailUrl){
            return NextResponse.json({ error: "Invalid video data" }, { status: 400 });
        }
        const videoData = {
            ...body,
            controls: body?.controls ?? true,
            transformation: {
                height: 1920,
                width: 1080,
                quality: body.transformation?.quality ?? 100, // Default quality if not provided
            }
        }

        const new_video = await Video.create(videoData);

        return NextResponse.json(new_video);


    }catch(error){
        return NextResponse.json({ error: "Failed to upload video" }, { status: 500 });
    }
}
