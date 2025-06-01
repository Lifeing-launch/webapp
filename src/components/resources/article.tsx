import React from "react";
import { Resource } from "./resource-card";

interface IArticle {
  resource: Resource;
}

export function Article({ resource }: IArticle) {
  if (resource.type !== "article")
    return <p className="mt-3"> This resource could not be displayed. </p>;

  return <p className="mt-3"> Content incoming</p>;
}
