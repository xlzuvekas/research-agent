import { cn, truncateUrl } from "@/lib/utils";
import { CheckIcon, LoaderCircle } from "lucide-react";

export function Progress({
  logs,
}: {
  logs: {
    message: string;
    done: boolean;
  }[];
}) {
  if (logs.length === 0) {
    return null;
  }

  return (
    <div data-test-id="progress-steps" className="animate-slide-in">
      <div className="bg-card/80 backdrop-blur-sm border border-border rounded-lg overflow-hidden text-sm py-3 px-2 shadow-sm">
        {logs.map((log, index) => (
          <div
            key={index}
            data-test-id="progress-step-item"
            className={`flex ${
              log.done || index === logs.findIndex((log) => !log.done)
                ? ""
                : "opacity-50"
            }`}
          >
            <div className="w-8">
              <div
                  className={cn(
                    "w-4 h-4 border flex items-center justify-center rounded-full mt-[10px] ml-[12px] transition-all duration-300",
                    log.done ? "border-primary bg-primary" : "border-border bg-background"
                  )}
                  data-test-id={log.done ? 'progress-step-item_done' : 'progress-step-item_loading'}
              >
                {log.done ? (
                  <CheckIcon className="w-3 h-3 text-primary-foreground" />
                ) : (
                  <LoaderCircle className="w-3 h-3 text-primary animate-spin" />
                )}
              </div>
              {index < logs.length - 1 && (
                <div
                  className={cn("h-full w-[1px] bg-border ml-[20px]")}
                ></div>
              )}
            </div>
            <div className="flex-1 flex justify-center py-2 pl-2 pr-4">
              <div className="flex-1 flex items-center text-xs">
                {log.message.replace(
                  /https?:\/\/[^\s]+/g, // Regex to match URLs
                  (url) => truncateUrl(url) // Replace with truncated URL
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}