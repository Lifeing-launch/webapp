import React from "react";
import { Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";

export interface Announcement {
  id: number;
  title: string;
  description?: string;
  when: Date;
  prompt: string;
  url: string;
}

interface IAnnouncementsCard {
  announcements: Announcement[];
}

export function AnnouncementsCard({ announcements }: IAnnouncementsCard) {
  return (
    <Card className="max-w-sm gap-0 p-4 pt-0">
      <CardContent className="p-0">
        {announcements.map((announcement, i) => (
          <div className="flex border-b last:border-b-0 py-4" key={i}>
            <Megaphone width={30} className="text-primary mt-0 mr-2" />
            <AnnouncementItem announcement={announcement} />
          </div>
        ))}
      </CardContent>
      <CardFooter className="p-0">
        <Button className="w-full" variant="secondary" asChild>
          <Link href="/announcements">See all announcements</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

function AnnouncementItem({ announcement }: { announcement: Announcement }) {
  return (
    <article className="flex flex-1 flex-col gap-2 text-sm">
      <h3 className="font-semibold text-base"> {announcement.title} </h3>
      <p className="text-xs font-medium">{announcement.when.toDateString()}</p>
      <p className="text-zinc-700">{announcement.description}</p>
      <div>
        <Link href={announcement.url} className="text-primary font-medium">
          {announcement.prompt}
        </Link>
      </div>
    </article>
  );
}
