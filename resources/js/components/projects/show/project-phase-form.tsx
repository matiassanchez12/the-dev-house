import { ProjectPhaseDrawer } from './project-phase-drawer';

interface ProjectPhaseFormProps {
    projectSlug: string;
    onSuccess?: () => void;
}

export function ProjectPhaseForm({ projectSlug, onSuccess }: ProjectPhaseFormProps) {
    return (
        <ProjectPhaseDrawer projectSlug={projectSlug} open onOpenChange={() => onSuccess?.()} />
    );
}
