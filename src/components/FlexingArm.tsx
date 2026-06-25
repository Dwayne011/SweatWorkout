/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

interface FlexingArmProps {
  className?: string;
  size?: number;
}

export default function FlexingArm({ className = "w-5 h-5", size = 20 }: FlexingArmProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={size ? { width: size, height: size } : undefined}
    >
      {/* Clenched Fist */}
      <path d="M10 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" />
      
      {/* Forearm curving down-right to the elbow */}
      <path d="M8 8c0 3 3 5 6 5" />
      
      {/* Large flexing bicep peak and outer tricep curve */}
      <path d="M9 4.5c3 0 6 1.5 6 4.5c0 3-1 4-1 4" />
      
      {/* Connection from elbow to shoulder/chest line */}
      <path d="M14 13c0 2.5-2 6-5 7" />
      <path d="M14 13c2 1 4 3.5 4 6" />
    </svg>
  );
}
