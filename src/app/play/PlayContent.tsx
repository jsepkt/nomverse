"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { GameRoom } from "@/components/game/GameRoom";

export const PlayContent: React.FC = () => {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") === "full" ? "full" : "half";

  return <GameRoom initialMode={mode} />;
};
