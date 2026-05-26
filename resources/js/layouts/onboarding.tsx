import { Head, Link } from '@inertiajs/react';
import { ReactNode } from 'react';
import { X } from 'lucide-react';

interface Props {
    children: ReactNode;
    currentStep: number;
    totalSteps: number;
}

export default function OnboardingLayout({ children, currentStep, totalSteps }: Props) {
    return (
        <div className="min-h-screen bg-background">
            <Head title="Welcome to DevCollab" />

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
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary rounded-full transition-all duration-300"
                            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Content */}
                {children}
            </div>
        </div>
    );
}
