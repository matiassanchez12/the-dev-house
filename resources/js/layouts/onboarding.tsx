import { Head, Link } from '@inertiajs/react';
import { ReactNode } from 'react';
import { X } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface Props {
    children: ReactNode;
    currentStep: number;
    totalSteps: number;
}

export default function OnboardingLayout({ children, currentStep, totalSteps }: Props) {
    const percent = (currentStep / totalSteps) * 100;

    return (
        <div className="min-h-screen bg-background">
            <Head title="Welcome to The Dev House" />

            <div className="max-w-2xl mx-auto px-4 py-12">
                {/* Progress indicator */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">
                            Step {currentStep} of {totalSteps}
                        </span>
                        <Link
                            href={route('onboarding.skip')}
                            method="post"
                            as="button"
                            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                        >
                            Skip all <X className="size-3" />
                        </Link>
                    </div>
                    <Progress value={percent} className="h-1.5" />
                </div>

                {/* Content */}
                {children}
            </div>
        </div>
    );
}
