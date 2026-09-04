"use client";

import React from "react";
import { NotificationList } from "@/components/ui/notification-list";

export default function NotificationListDemo() {
  return (
    <div className="flex min-h-[260px] w-full items-center justify-center p-4">
      <NotificationList />
    </div>
  );
}
