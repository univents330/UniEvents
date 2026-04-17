"use client";

import type { Event } from "@voltaze/schema";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { EventCard } from "../event-card/event-card";
import { EventCardSkeleton } from "../event-card/event-card-skeleton";

interface EventCarouselProps {
	events: Event[];
	isLoading?: boolean;
	className?: string;
}

interface SingleCarouselProps {
	events: Event[];
	isLoading?: boolean;
	className?: string;
}

function SingleCarousel({
	events,
	isLoading = false,
	className = "",
}: SingleCarouselProps) {
	const carouselRef = useRef<HTMLDivElement>(null);
	const [canScrollLeft, setCanScrollLeft] = useState(false);
	const [canScrollRight, setCanScrollRight] = useState(true);
	const [isDragging, setIsDragging] = useState(false);
	const [startX, setStartX] = useState(0);
	const [scrollLeft, setScrollLeft] = useState(0);

	const checkScrollButtons = useCallback(() => {
		if (carouselRef.current) {
			const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
			setCanScrollLeft(scrollLeft > 0);
			setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
		}
	}, []);

	useEffect(() => {
		checkScrollButtons();
		const handleResize = () => checkScrollButtons();
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, [checkScrollButtons]);

	const scroll = (direction: "left" | "right") => {
		if (carouselRef.current) {
			const scrollAmount = carouselRef.current.clientWidth * 0.8;
			carouselRef.current.scrollBy({
				left: direction === "left" ? -scrollAmount : scrollAmount,
				behavior: "smooth",
			});
		}
	};

	const handleMouseDown = (e: React.MouseEvent) => {
		setIsDragging(true);
		setStartX(e.pageX - (carouselRef.current?.offsetLeft || 0));
		setScrollLeft(carouselRef.current?.scrollLeft || 0);
		carouselRef.current?.classList.add("cursor-grabbing");
	};

	const handleMouseUp = () => {
		setIsDragging(false);
		carouselRef.current?.classList.remove("cursor-grabbing");
	};

	const handleMouseMove = (e: React.MouseEvent) => {
		if (!isDragging || !carouselRef.current) return;
		e.preventDefault();
		const x = e.pageX - (carouselRef.current.offsetLeft || 0);
		const walk = (x - startX) * 2;
		carouselRef.current.scrollLeft = scrollLeft - walk;
	};

	const handleMouseLeave = () => {
		setIsDragging(false);
		carouselRef.current?.classList.remove("cursor-grabbing");
	};

	if (isLoading) {
		return (
			<div className={`relative ${className}`}>
				<div className="scrollbar-hide flex gap-4 overflow-x-auto sm:gap-6">
					{[...Array(3)].map((_, i) => (
						<div key={i} className="w-72 flex-none sm:w-80">
							<EventCardSkeleton />
						</div>
					))}
				</div>
			</div>
		);
	}

	if (events.length === 0) {
		return (
			<div
				className={`flex flex-col items-center gap-4 py-8 sm:py-12 ${className}`}
			>
				<p className="text-center text-muted-foreground text-sm italic sm:text-base">
					No events found.
				</p>
			</div>
		);
	}

	return (
		<div className={`relative ${className}`}>
			{canScrollLeft && (
				<button
					type="button"
					onClick={() => scroll("left")}
					className="absolute top-1/2 left-0 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-200 bg-white p-2 shadow-lg transition-colors hover:bg-slate-50"
					aria-label="Scroll left"
				>
					<ChevronLeft className="h-4 w-4 text-slate-600" />
				</button>
			)}

			{canScrollRight && (
				<button
					type="button"
					onClick={() => scroll("right")}
					className="absolute top-1/2 right-0 z-10 translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-200 bg-white p-2 shadow-lg transition-colors hover:bg-slate-50"
					aria-label="Scroll right"
				>
					<ChevronRight className="h-4 w-4 text-slate-600" />
				</button>
			)}

			<section
				ref={carouselRef}
				aria-label="Event carousel"
				className={`scrollbar-hide flex cursor-grab gap-4 overflow-x-auto sm:gap-6 ${
					isDragging ? "cursor-grabbing" : ""
				}`}
				onMouseDown={handleMouseDown}
				onMouseUp={handleMouseUp}
				onMouseMove={handleMouseMove}
				onMouseLeave={handleMouseLeave}
				onScroll={checkScrollButtons}
			>
				{events.map((event) => (
					<div key={event.id} className="w-72 flex-none sm:w-80">
						<EventCard event={event} className="h-full" />
					</div>
				))}
			</section>

			<style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
		</div>
	);
}

export function EventCarousel({
	events,
	isLoading = false,
	className = "",
}: EventCarouselProps) {
	if (isLoading) {
		return (
			<div className={`space-y-6 ${className}`}>
				<SingleCarousel events={[]} isLoading={true} />
				<SingleCarousel events={[]} isLoading={true} />
			</div>
		);
	}

	if (events.length === 0) {
		return (
			<div
				className={`flex flex-col items-center gap-4 py-8 sm:py-12 ${className}`}
			>
				<p className="text-center text-muted-foreground text-sm italic sm:text-base">
					No events found matching your criteria.
				</p>
			</div>
		);
	}

	// Split events into two rows
	const midPoint = Math.ceil(events.length / 2);
	const firstRowEvents = events.slice(0, midPoint);
	const secondRowEvents = events.slice(midPoint);

	return (
		<div className={`space-y-6 ${className}`}>
			<SingleCarousel events={firstRowEvents} isLoading={false} />
			<SingleCarousel events={secondRowEvents} isLoading={false} />
		</div>
	);
}
