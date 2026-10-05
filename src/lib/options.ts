import { useMemo } from "react";
import { useList, type Client, type Profile, type Project } from "./data";
import type { Option } from "./constants";

export function useRefOptions() {
  const clients = useList<Client>("clients");
  const projects = useList<Project>("projects");
  const profiles = useList<Profile>("profiles");
  return useMemo(() => ({
    clients: (clients.data ?? []).map<Option>((c) => ({ value: c.id, label: c.company ? `${c.name} — ${c.company}` : c.name })),
    projects: (projects.data ?? []).map<Option>((p) => ({ value: p.id, label: p.name })),
    profiles: (profiles.data ?? []).map<Option>((p) => ({ value: p.id, label: p.full_name || p.email })),
    projectList: projects.data ?? [],
  }), [clients.data, projects.data, profiles.data]);
}
