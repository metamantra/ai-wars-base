"use client";

import { useEffect } from "react";
import sdk from "@farcaster/frame-sdk";

export default function FrameInit() {
  useEffect(() => {
    const init = async () => {
      // Tell the Base App that we are ready to display
      await sdk.actions.ready(); 
    };
    init();
  }, []);

  return null;
}