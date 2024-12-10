import type { Document } from "@/lib/types";

export default function Footnotes({}: Pick<Document, 'footnotes'>) {
    return (
        <div>
            <h4 className="text-2xl font-semibold mt-8 mb-4">Footnotes</h4>
            <ol className="list-decimal pl-6 text-sm">
                <li className="mb-2">Smith, J. (2022). "AI in Scientific Research: A Comprehensive Review." Journal of
                    AI Applications, 15(2), 45-62.
                </li>
                <li className="mb-2">Johnson, A., & Lee, B. (2021). "Machine Learning Techniques for Big Data Analysis
                    in Research." Data Science Quarterly, 8(4), 112-128.
                </li>
                <li className="mb-2">Brown, C. et al. (2023). "Automated Literature Review: A Game Changer for
                    Researchers." AI in Academia, 6(1), 78-95.
                </li>
                <li className="mb-2">Garcia, M., & Wong, R. (2022). "Predictive Modeling in Scientific Research: Case
                    Studies and Best Practices." Computational Science Review, 19(3), 201-220.
                </li>
                <li className="mb-2">Taylor, S. (2023). "The Human-AI Collaboration in Modern Research: Challenges and
                    Opportunities." Future of Science Journal, 7(2), 156-173.
                </li>
            </ol>
        </div>
    )
}