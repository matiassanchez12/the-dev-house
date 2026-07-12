import { Head } from '@inertiajs/react';
import { ReactNode } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface Props {
    children: ReactNode;
    currentStep: number;
    totalSteps: number;
    onSkipRequest: () => void;
}

export default function OnboardingLayout({ children, currentStep, totalSteps, onSkipRequest }: Props) {
    const percent = (currentStep / totalSteps) * 100;

    return (
        <div className="min-h-screen bg-background">
            <Head title="Configurá tu perfil inicial en The Dev House" />

            <div className="max-w-2xl mx-auto px-4 py-12">
                {/* Progress indicator */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">
                            Paso {currentStep} de {totalSteps}
                        </span>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={onSkipRequest}
                            className="text-sm text-muted-foreground hover:text-foreground"
                        >
                            Finalizar más tarde <X className="size-3" />
                        </Button>
                    </div>
                    <Progress value={percent} className="h-1.5" />
                </div>

                {/* Content */}
                {children}
            </div>
        </div>
    );
}
