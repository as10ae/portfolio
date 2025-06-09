import { projects } from "@/data";
import React from "react";

const RecentProjects = () => {
  return (
    <div className="py-20">
      <h1 className="heading">
        A Small Selection of{" "}
        <span className="text-purple">Recent Projects</span>
      </h1>
      <div className="flex flex-wrap items-center justify-center p-4 gap-16 mt-10">
        {projects.map(({ id, title, des, img, iconLists, link }) => (
          <div key={id}>{title}</div>
        ))}
      </div>
    </div>
  );
};

export default RecentProjects;
