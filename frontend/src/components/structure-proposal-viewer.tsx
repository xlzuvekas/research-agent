"use client"

import { useCallback, useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Proposal, ProposalSection, ProposalSectionName } from "@/lib/types";
import { useResearch } from "@/components/research-context";

function ProposalItem({
    proposalItemKey,
    proposal,
    renderSection,
    title,
}: {
    proposal: Proposal
    proposalItemKey: ProposalSectionName,
    renderSection: (name: ProposalSectionName, title: string, section: ProposalSection) => React.ReactNode
    title: string
}) {
    const proposalItem = proposal[proposalItemKey]

    return (
        <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground mb-2">{proposalItem.description}</p>
            {Object.entries(proposalItem).map(([key, section]) =>
                typeof section === 'string' ? null : renderSection(proposalItemKey, key, section)
            )}
        </div>
    )
}

export function ProposalViewer({
    onSubmit,
}: {
    onSubmit: (approved: boolean, proposal: Proposal) => void,
}) {
    const { state } = useResearch()
    const proposal = state.proposal
    console.log("state: ", proposal)
    const [reviewedProposal, setReviewedProposal] = useState(proposal)

    const handleCheckboxChange = (
        sectionType: ProposalSectionName,
        sectionKey: string,
        checked: boolean
    ) => {
        setReviewedProposal((prev) => {
            const newStructure = {...prev}
            // @ts-expect-error -- ignore
            newStructure[sectionType][sectionKey].approved = checked
            console.log("Updated proposal:", newStructure); // Log the new state after update
            return newStructure
        })
    }

    const handleSubmit = useCallback((approved: boolean) => {
        onSubmit(approved, reviewedProposal)
    }, [onSubmit, reviewedProposal])

    const renderSection = (
        sectionType: ProposalSectionName,
        sectionKey: string,
        section: ProposalSection
    ) => (
        <div key={`${sectionType}-${sectionKey}`} className="flex items-start space-x-2 mb-2">
            <Checkbox
                id={`${sectionType}-${sectionKey}`}
                checked={section.approved}
                onCheckedChange={(checked) => handleCheckboxChange(sectionType, sectionKey, checked as boolean)}
            />
            <div className="grid gap-1.5 leading-none">
                <label
                    htmlFor={`${sectionType}-${sectionKey}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                    {section.title}
                </label>
                <p className="text-sm text-muted-foreground">{section.description}</p>
            </div>
        </div>
    )

    return (
        <Card className="w-full max-w-4xl mx-auto border-black/10 shadow-none rounded-none">
            <CardHeader>
                <CardTitle>Research Paper Proposal</CardTitle>
                <CardDescription>
                    I've prepared a proposal for structuring your research. Feel free to modify any sections or points to better match your needs - we can adjust until it's exactly what you're looking for.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[60vh] pr-4">
                    <div className="space-y-6">
                        {ProposalItem({ title: 'Sections', proposalItemKey: ProposalSectionName.Sections, proposal: reviewedProposal, renderSection })}
                    </div>
                </ScrollArea>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button onClick={() => handleSubmit(false)} className="text-red-500">Reject Proposal</Button>
                <Button onClick={() => handleSubmit(true)} className="bg-[var(--primary)] text-white hover:bg-[#68330d]">Approve Proposal</Button>
            </CardFooter>
        </Card>
    )
}
