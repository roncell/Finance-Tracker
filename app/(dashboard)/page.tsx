"use client";

import { Suspense } from "react";

import { Filters } from "@/components/filters";
import { DataGrid } from "@/components/data-grid";
import { DataCharts } from "@/components/data-charts";

export default function Home() {
  return (
    <div className="relative max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
      <Suspense>
        <div className="bg-card border rounded-lg shadow-sm p-3 mb-8">
          <Filters />
        </div>
        <DataGrid />
        <DataCharts />
      </Suspense>
    </div>
  );
};
