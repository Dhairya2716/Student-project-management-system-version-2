'use client';

import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { motion, useInView } from 'motion/react';
import type { Transition } from 'motion/react';

type AnimateBy = 'words' | 'letters';

interface BlurTextProps {
    text?: string;
    delay?: number;
    className?: string;
    animateBy?: AnimateBy;
    direction?: 'top' | 'bottom' | 'left' | 'right' | 'none';
    threshold?: number;
    rootMargin?: string;
    animationFrom?: Record<string, string | number>;
    animationTo?: Record<string, string | number>[];
    easing?: (t: number) => number;
    onAnimationComplete?: () => void;
    stepDuration?: number;
}

const defaultFrom: Record<string, string | number> = {
    filter: 'blur(10px)',
    opacity: 0,
    y: 5
};

const defaultTo: Record<string, string | number>[] = [
    {
        filter: 'blur(5px)',
        opacity: 0.5,
        y: 3
    },
    {
        filter: 'blur(0px)',
        opacity: 1,
        y: 0
    }
];

export default function BlurText({
    text = '',
    delay = 50,
    className = '',
    animateBy = 'words',
    direction = 'bottom',
    threshold = 0.1,
    rootMargin = '0px',
    animationFrom,
    animationTo,
    easing = (t: number) => t,
    onAnimationComplete,
    stepDuration = 0.35
}: BlurTextProps) {
    const elements = animateBy === 'words' ? text.split(' ') : text.split('');
    const [completedCount, setCompletedCount] = useState(0);
    const ref = useRef<HTMLParagraphElement>(null);
    const inView = useInView(ref, {
        once: true,
        margin: rootMargin as `${number}px ${number}px ${number}px ${number}px`,
        amount: threshold
    });

    const fromSnapshot = useMemo(() => {
        const base = animationFrom ?? { ...defaultFrom };
        if (direction === 'top') base.y = -5;
        else if (direction === 'left') { delete base.y; base.x = -5; }
        else if (direction === 'right') { delete base.y; base.x = 5; }
        else if (direction === 'none') { delete base.y; }
        return base;
    }, [animationFrom, direction]);

    const toSnapshots = useMemo(() => animationTo ?? defaultTo, [animationTo]);

    const totalSteps = toSnapshots.length + 1;
    const times = Array.from({ length: totalSteps }, (_, i) => i / (totalSteps - 1));
    const totalDuration = stepDuration * toSnapshots.length;

    const handleComplete = useCallback(() => {
        setCompletedCount(c => c + 1);
    }, []);

    useEffect(() => {
        if (completedCount === elements.length && onAnimationComplete) {
            onAnimationComplete();
        }
    }, [completedCount, elements.length, onAnimationComplete]);

    const buildKeyframes = (from: Record<string, string | number>, tos: Record<string, string | number>[]) => {
        const keys = new Set<string>();
        Object.keys(from).forEach(k => keys.add(k));
        tos.forEach(t => Object.keys(t).forEach(k => keys.add(k)));

        const result: Record<string, (string | number)[]> = {};
        keys.forEach(key => {
            result[key] = [from[key] ?? 0, ...tos.map(t => t[key] ?? 0)];
        });
        return result;
    };

    return (
        <p ref={ref} className={`flex flex-wrap ${className}`}>
            {elements.map((segment, index) => {
                const animateKeyframes = buildKeyframes(fromSnapshot, toSnapshots);

                const spanTransition: Transition = {
                    duration: totalDuration,
                    times,
                    delay: (index * delay) / 1000,
                    ease: easing
                };

                return (
                    <motion.span
                        key={index}
                        initial={fromSnapshot}
                        animate={inView ? animateKeyframes : fromSnapshot}
                        transition={spanTransition}
                        onAnimationComplete={handleComplete}
                        style={{ display: 'inline-block', willChange: 'filter, opacity, transform' }}
                    >
                        {segment === ' ' ? '\u00A0' : segment}
                        {animateBy === 'words' && index < elements.length - 1 && '\u00A0'}
                    </motion.span>
                );
            })}
        </p>
    );
}
