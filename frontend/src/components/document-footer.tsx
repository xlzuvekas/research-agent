
export default function Footer({ footer }: { footer?: string }) {
    return (
        <div className="border-t border-gray-200 mt-8 pt-2">
            <h4 className="text-xs font-medium text-gray-700 mb-2">References</h4>
            <div className="text-[10px] text-gray-600">
                {footer?.split('\n').map((line, i) => {
                    if (!line.trim()) return null;
                    const match = line.match(/\[\^(\d+)\]:\s*\[(.*?)\]\((.*?)\)(.*)/);
                    if (!match) return <p key={i}>{line}</p>;
                    
                    const [_, num, text, url, rest] = match;
                    return (
                        <p key={i} className="leading-normal flex gap-1">
                            {/* Position sup 5px above baseline for better alignment */}
                            <sup className="relative top-[5px]">{num}</sup>
                            <span>
                                <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                    {text}
                                </a>
                                {rest}
                            </span>
                        </p>
                    );
                })}
            </div>
        </div>
    )
}