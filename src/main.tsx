import { useEffect, useState } from "react";
import "./main.css";
import reactLogo from "./assets/react.svg";
import FarmLogo from "./assets/logo.png";

type Meta = {
  project: string;
  dataset: string;
  role: string;
  entity: string;
};

function parseMeta(meta: unknown, i: number): Meta {
  if (typeof meta !== "object") {
    throw new Error(`Metas[${i}] is not an object`);
  }
  if (meta === null) {
    throw new Error(`Metas[${i}] is null`);
  }
  if (!("Project" in meta)) {
    throw new Error(`Metas[${i}].Project not found`);
  }
  if (typeof meta.Project !== "string") {
    throw new Error(`Metas[${i}].Project is not a string`);
  }
  if (!("Dataset" in meta)) {
    throw new Error(`Metas[${i}].Dataset not found`);
  }
  if (typeof meta.Dataset !== "string") {
    throw new Error(`Metas[${i}].Dataset is not a string`);
  }
  if (!("Role" in meta)) {
    throw new Error(`Metas[${i}].Role not found`);
  }
  if (typeof meta.Role !== "string") {
    throw new Error(`Metas[${i}].Role is not a string`);
  }
  if (!("Entity" in meta)) {
    throw new Error(`Metas[${i}].Entity not found`);
  }
  if (typeof meta.Entity !== "string") {
    throw new Error(`Metas[${i}].Entity is not a string`);
  }

  return {
    project: meta.Project,
    dataset: meta.Dataset,
    role: meta.Role,
    entity: meta.Entity,
  };
}

function parseData(data: unknown): Meta[] {
  if (typeof data !== "object") {
    throw new Error("Data is not an object");
  }
  if (data === null) {
    throw new Error("Data is null");
  }
  if (!("Metas" in data)) {
    throw new Error("Metas not found");
  }
  if (!Array.isArray(data.Metas)) {
    throw new Error("Metas is not an array");
  }

  return data.Metas.map(parseMeta);
}

// Meta[] -> Record<entity, { count: number; projects: Record<project, Record<dataset, role[]>> }>
function convertEntityMap(
  metas: Meta[],
): Record<
  string,
  { count: number; projects: Record<string, Record<string, string[]>> }
> {
  return metas
    .filter((meta) => !!meta.entity)
    .reduce((acc, meta) => {
      if (!(meta.entity in acc)) {
        acc[meta.entity] = {
          count: 0,
          projects: {},
        };
      }
      if (!(meta.project in acc[meta.entity].projects)) {
        acc[meta.entity].projects[meta.project] = {};
      }
      if (!(meta.dataset in acc[meta.entity].projects[meta.project])) {
        acc[meta.entity].projects[meta.project][meta.dataset] = [];
      }

      acc[meta.entity].projects[meta.project][meta.dataset].push(meta.role);
      acc[meta.entity].count += 1;

      return acc;
    }, {} as Record<string, { count: number; projects: Record<string, Record<string, string[]>> }>);
}

export function Main() {
  const [allMetas, setAllMetas] = useState([] as Meta[]);
  const [metas, setMetas] = useState([] as Meta[]);
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    async function fetchData() {
      console.log(`${new Date().toISOString()} fetchData`);
      const response = await fetch(".bqiam-cache-file.json");
      if (!response.ok) {
        throw new Error(
          `.bqiam-cache-file.toml: ${response.status} ${response.statusText}`,
        );
      }

      const obj = await response.json();
      console.log(`${new Date().toISOString()} parseData`);
      const data = parseData(obj);
      console.log(`${new Date().toISOString()} setMetas`);
      setAllMetas(data);
      setMetas(data);
    }

    fetchData();
  }, []);

  useEffect(() => {
    console.log(`${new Date().toISOString()} keyword: ${keyword}`);
    const filtered = allMetas.filter((meta) => {
      return (
        meta.entity.toLowerCase().includes(keyword.toLowerCase()) ||
        meta.project.toLowerCase().includes(keyword.toLowerCase()) ||
        meta.dataset.toLowerCase().includes(keyword.toLowerCase())
      );
    });

    setMetas(filtered);
  }, [keyword]);

  return (
    <>
      <div>
        <a href="https://farmfe.org/" target="_blank">
          <img src={FarmLogo} className="logo" alt="Farm logo" />
        </a>
      </div>
      <h1>bqiam</h1>
      <input
        type="text"
        placeholder="Search Keyword"
        onChange={(e) => setKeyword(e.target.value)}
      />
      {metas.length === 0 && (
        <>
          <p>Loading...</p>
          <a href="https://react.dev" target="_blank">
            <img src={reactLogo} className="logo react" alt="React logo" />
          </a>
        </>
      )}
      <div className="card">
        {Object.entries(convertEntityMap(metas))
          .sort((a, b) => b[1].count - a[1].count)
          .slice(0, 100)
          .map(([entry, { count, projects }]) => {
            return (
              <div key={entry} className="card-item">
                <h2>
                  {entry} ({count})
                </h2>
                {keyword &&
                  Object.entries(projects).map(([project, datasets]) => (
                    <div key={project}>
                      <h3>
                        {project} ({Object.keys(datasets).length})
                      </h3>
                      <ul>
                        {Object.entries(datasets).map(([dataset, roles]) => (
                          <li key={dataset}>
                            {dataset}: {roles.join(", ")}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
              </div>
            );
          })}
      </div>
      <p className="read-the-docs">
        Click on the Farm and React logos to learn more
      </p>
    </>
  );
}
