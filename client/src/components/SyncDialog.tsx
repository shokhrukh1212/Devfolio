import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSyncProjects } from "@/hooks/use-projects";
import { Github, Loader2 } from "lucide-react";

export function SyncDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [username, setUsername] = useState("");
  const [token, setToken] = useState("");
  const { mutate: sync, isPending } = useSyncProjects();

  const handleSync = () => {
    sync(
      { githubUsername: username, githubToken: token || undefined },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sync from GitHub</DialogTitle>
          <DialogDescription>
            Enter your GitHub username to fetch your public repositories.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="username">GitHub Username</Label>
            <Input
              id="username"
              placeholder="e.g. torvalds"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="token" className="flex items-center gap-2">
              Personal Access Token
              <span className="text-xs text-muted-foreground font-normal">(Optional, for private repos)</span>
            </Label>
            <Input
              id="token"
              type="password"
              placeholder="ghp_..."
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSync} disabled={isPending || !username}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <Github className="mr-2 h-4 w-4" />
                Sync Projects
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
