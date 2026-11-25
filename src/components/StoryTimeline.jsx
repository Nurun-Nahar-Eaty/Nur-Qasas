import React from 'react';
import { Sparkles, Flame, Shield, Award, CheckCircle2, Quote } from 'lucide-react';

export const StoryTimeline = ({ steps = [] }) => {
  if (!steps || steps.length === 0) return null;

  const getStepIcon = (type, number) => {
    switch (type) {
      case 'origin':
        return <Sparkles size={12} />;
      case 'conflict':
        return <Flame size={12} />;
      case 'miracle':
        return <Shield size={12} />;
      case 'resolution':
        return <Award size={12} />;
      default:
        return <span>{number}</span>;
    }
  };

  const getStepTypeLabel = (type) => {
    switch (type) {
      case 'origin':
        return 'Genesis / Origin';
      case 'conflict':
        return 'Trial & Test';
      case 'miracle':
        return 'Sign & Miracle';
      case 'resolution':
        return 'Resolution & Triumph';
      default:
        return 'Narrative Milestone';
    }
  };

  return (
    <div className="timeline-stepper" role="feed" aria-label="Chronological Story Milestones">
      {steps.map((step, idx) => {
        const stepNum = step.step_number || idx + 1;
        const stepType = step.type || 'milestone';

        return (
          <article
            key={idx}
            className={`timeline-step type-${stepType}`}
            aria-labelledby={`step-title-${idx}`}
          >
            {/* Circular Marker */}
            <div className="step-marker" aria-hidden="true">
              {getStepIcon(stepType, stepNum)}
            </div>

            {/* Step Card Content */}
            <div className="step-card">
              <div className="step-title-row">
                <h4 id={`step-title-${idx}`} className="step-label">
                  {step.title}
                </h4>
                <span className="step-tag">
                  {getStepTypeLabel(stepType)}
                </span>
              </div>

              <p className="step-detail">
                {step.detail}
              </p>

              {/* Render Quranic Quotes if present */}
              {step.quotes && step.quotes.length > 0 && (
                <div className="step-quotes-wrap">
                  {step.quotes.map((q, qIdx) => (
                    <blockquote key={qIdx} className="quote-card">
                      "{q}"
                    </blockquote>
                  ))}
                </div>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
};
