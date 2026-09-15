import { knowledge } from "@/lib/mock-data";
import { KnowledgeBrowser } from "./KnowledgeBrowser";

export const metadata = { title: "Knowledge hub · Digital Brain" };

export default function KnowledgePage() {
  return <KnowledgeBrowser items={knowledge} />;
}
