"use client";


import { cn } from "@/lib/utils";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import ImageWithSkeleton from "./ImageWithSkeleton";

interface SwipeCardsProps {
  className?: string;
}

const SwipeCards = ({ className }: SwipeCardsProps) => {
  const [cards, setCards] = useState<Card[]>(cardData);

  useEffect(() => {
    const interval = setInterval(() => {
      setCards((pv) => {
        const newArray = [...pv];
        const frontCard = newArray.pop();
        if (frontCard) {
          newArray.unshift(frontCard);
        }
        return newArray;
      });
    }, 300000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={cn(
        "relative grid h-[233px] w-[175px] place-items-center",
        className,
      )}
    >
      {cards.map((card, index) => {
        const depth = cards.length - 1 - index;
        return (
          <Card
            key={card.id}
            cards={cards}
            setCards={setCards}
            depth={depth}
            {...card}
          />
        );
      })}
    </div>
  );
};

const Card = ({
  id,
  url,
  setCards,
  cards,
  depth,
}: {
  id: number;
  url: string;
  setCards: Dispatch<SetStateAction<Card[]>>;
  cards: Card[];
  depth: number;
}) => {
  const x = useMotionValue(0);

  const rotateRaw = useTransform(x, [-150, 150], [-18, 18]);
  const opacity = useTransform(x, [-100, 0, 100], [0, 1, 0]);

  const isFront = id === cards[cards.length - 1]?.id;

  const rotate = useTransform(() => {
    const offset = isFront ? 0 : id % 2 ? 6 : -6;
    return `${rotateRaw.get() + offset}deg`;
  });

  useEffect(() => {
    if (!isFront) {
      const currentX = x.get();
      if (currentX !== 0) {
        animate(x, 0, { duration: 0.2 });
      }
    }
  }, [isFront, x]);

  const handleDragEnd = (event: any, info: { offset: { x: number } }) => {
    if (Math.abs(info.offset.x) > 100) {
      // If swiped far enough, move the card to the back
      setCards((pv) => {
        const newArray = [...pv];
        const frontCard = newArray.pop();
        if (frontCard) {
          newArray.unshift(frontCard);
        }
        return newArray;
      });
    } else {
      // Otherwise, animate the card back to the center
      animate(x, 0, {
        type: "spring",
        stiffness: 400,
        damping: 40,
      });
    }
  };

  return (
    <motion.div
      className="absolute h-[233px] w-[175px] origin-bottom overflow-hidden rounded-lg bg-white hover:cursor-grab active:cursor-grabbing"
      style={{
        gridRow: 1,
        gridColumn: 1,
        x,
        opacity,
        rotate,
        boxShadow: isFront
          ? "0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3)"
          : undefined,
      }}
      animate={{
        // Ensure the top card is always the largest paint candidate.
        scale: isFront ? 1 : Math.max(0.85, 0.94 - depth * 0.04),
      }}
      drag={isFront ? "x" : false}
      dragConstraints={{
        left: -150,
        right: 150,
        top: 0,
        bottom: 0,
      }}
      onDragEnd={handleDragEnd}
    >
      {isFront ? (
        <ImageWithSkeleton
          src={url}
          alt="Photo of Neeraj"
          width={175}
          height={233}
          sizes="175px"
          quality={75}
          draggable={false}
          containerClassName="h-full w-full pointer-events-none"
          className="h-full w-full select-none object-cover"
          fetchPriority="high"
          priority
        />
      ) : (
        <ImageWithSkeleton
          src={url}
          alt=""
          width={175}
          height={233}
          sizes="175px"
          quality={70}
          draggable={false}
          containerClassName="h-full w-full pointer-events-none"
          className="h-full w-full select-none object-cover"
          fetchPriority="low"
          loading="lazy"
        />
      )}
    </motion.div>
  );
};

export default SwipeCards;

type Card = {
  id: number;
  url: string;
};

const cardData: Card[] = [
  {
    id: 1,
    url: "/img/myImage1.png",
  },
  {
    id: 2,
    url: "/img/myImage2.png",
  },
  {
    id: 3,
    url: "/img/myImage3.png",
  }
];
