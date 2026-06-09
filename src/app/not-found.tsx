import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="notfound">
      <h2>Not in your Trove</h2>
      <p>That item doesn’t exist (or was deleted).</p>
      <Button variant="default" icon="home" href="/">
        Back to launchpad
      </Button>
    </div>
  );
}
