import { Bell, ChevronDown, Command, Search } from "lucide-react";
import { BlossomMark } from "@/components/blossom-mark";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function TopNav() {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <a className="brand" href="#overview" aria-label="BlossomView overview">
          <BlossomMark className="brand-mark" />
          <span>
            Blossom<span className="brand-view">View</span>
          </span>
        </a>
        <div className="nav-actions">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Search insights"
            title="Search insights"
          >
            <Search data-icon="inline-start" />
          </Button>
          <span
            className="command-hint"
            aria-label="Keyboard shortcut Command K"
          >
            <Command aria-hidden="true" />
            <span>K</span>
          </span>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Notifications"
            title="Notifications"
          >
            <Bell data-icon="inline-start" />
          </Button>
          <button
            className="account-button"
            type="button"
            aria-label="Open account menu"
          >
            <Avatar>
              <AvatarFallback>KV</AvatarFallback>
            </Avatar>
            <ChevronDown aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
}
