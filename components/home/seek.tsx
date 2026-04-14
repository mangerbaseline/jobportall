import Link from "next/link";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Binoculars, Briefcase } from "lucide-react";
interface CardHome {
    seek?: string,
    postJob?: string
    link?: string
}
export function HomeCard({ seek, postJob, link }: CardHome) {

    return (
        <Link href={link || ""}>
            <Card className="w-full lg:w-md">
                <CardHeader className="p-4 lg:text-2xl font-medium text-muted-foreground">
                    {seek ? seek : postJob}
                </CardHeader>
                <CardContent> {seek ? (<Binoculars className="w-auto h-30" />) : (<Briefcase className="w-auto h-30" />)}</CardContent>

            </Card></Link>
    )
}
