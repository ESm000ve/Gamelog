import { Layers, Play, CheckCircle2, Heart } from "lucide-react";
import type { Status } from "../../types";

export function StatusIcon({ status }: { status: Status }) {
  switch (status) {
    case "Backlog":
      return <Layers size={10} />;
    case "Playing":
      return <Play size={10} />;
    case "Played":
      return <CheckCircle2 size={10} />;
    case "Wishlist":
      return <Heart size={10} />;
    default:
      return null;
  }
}
