'use client';
import React, { useEffect, useState } from 'react';
import { FaFire, FaPlus } from 'react-icons/fa';
import { FiTrash } from 'react-icons/fi';
import { motion } from 'framer-motion';

export const NotionKanban = () => {
  return (
    <div className="h-screen w-screen bg-neutral-900 text-neutral-50">
      <Board />
    </div>
  );
};

const Board = () => {
  const [cards, setCards] = useState([]);
  const [hasChecked, setHasChecked] = useState(false);
  // will contain all the functionality of the board - as well as the UI - give a padding for each enclosing container for breathing - both x and y axes should be scrollable on overflow
  useEffect(() => {
    hasChecked && localStorage.setItem('cards', JSON.stringify(cards));
  }, [cards]);

  useEffect(() => {
    setHasChecked(true);
    const storedCards = localStorage.getItem('cards');
    setCards(storedCards ? JSON.parse(storedCards) : []);
    setHasChecked(true);
  }, []);
  return (
    <div className="flex h-full w-full overflow-scroll p-10 gap-3">
      <Column
        title="Backlog"
        titleColor="text-neutral-500"
        titleCountBaground="bg-neutral-500/50"
        column={'backlog'}
        cards={cards}
        setCards={setCards}
      />
      <Column
        title="Todo"
        titleColor="text-yellow-500"
        titleCountBaground="bg-yellow-500/50"
        column={'todo'}
        cards={cards}
        setCards={setCards}
      />
      <Column
        title="In progress"
        titleColor="text-blue-200"
        titleCountBaground="bg-blue-200/50"
        column={'doing'}
        cards={cards}
        setCards={setCards}
      />
      <Column
        title="Complete"
        titleColor="text-emerald-200"
        titleCountBaground="bg-emerald-200/50"
        column={'done'}
        cards={cards}
        setCards={setCards}
      />
      <Burnbarrel setCards={setCards} />
    </div>
  ); // not sure why the gap-3 is used ?
};

// This accept props for various configs - 1. title 2. titleColor 3. column - uniqueIdentifier 4. cards 5. setCards - access the parent components fucntionality - only 1 layer so props is fine - no prop drilling here
const Column = ({
  title,
  titleColor,
  titleCountBaground,
  column,
  cards,
  setCards,
}) => {
  // take in all cards and render filter based on columns to render
  const [active, setActive] = useState(false); // hover styling for the column

  const handleDragStart = (e, card) => {
    e.dataTransfer.setData('cardId', card.id);
    console.log(card.id);
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    highlightIndicator(e);
    setActive(true);
  };
  const handleDragLeave = () => {
    setActive(false);
    clearHighlights();
  };
  const handleDragEnd = (e) => {
    setActive(false);
    clearHighlights();
    const cardId = e.dataTransfer.getData('cardId');
    console.log(cardId, 111);
    const indicators = getIndicators();
    console.log(indicators);
    const { element } = getNearestIndicator(e, indicators);
    const before = element.dataset.before || '-1';
    if (before != cardId) {
      let copy = [...cards];
      let cardToTransfer = copy.find((card) => card.id === cardId);
      if (!cardToTransfer) return;
      cardToTransfer = { ...cardToTransfer, column };
      copy = copy.filter((card) => card.id !== cardId);
      const moveToBack = before === '-1';
      if (moveToBack) {
        copy.push(cardToTransfer);
      } else {
        const insertAt = copy.findIndex((card) => card.id === before);
        if (setCards === undefined) return;
        copy.splice(insertAt, 0, cardToTransfer);
      }
      setCards(copy);
    }
  };
  const highlightIndicator = (e) => {
    const indicators = getIndicators();
    clearHighlights(indicators);
    const el = getNearestIndicator(e, indicators);
    el.element.style.opacity = '1';
  };
  const clearHighlights = (inds) => {
    const indicators = inds || getIndicators();
    indicators.forEach((indicator) => {
      indicator.style.opacity = '0';
    });
  };

  const getNearestIndicator = (e, indicators) => {
    const DISTANCE_OFFSET = 50;
    const el = indicators.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = e.clientY - (box.top + DISTANCE_OFFSET);

        if (offset < 0 && offset > closest.offset) {
          return {
            offset: offset,
            element: child,
          };
        } else {
          return closest;
        }
      },
      {
        offset: Number.NEGATIVE_INFINITY,
        element: indicators[indicators.length - 1],
      }
    );

    return el;
  };
  const getIndicators = () => {
    return Array.from(document.querySelectorAll(`[data-column="${column}"]`));
  };
  const filteredCards = cards.filter((card) => card.column === column);
  return (
    <div className="w-56 shrink-0">
      {/* heading */}
      <div className="flex mb-3 items-center justify-around">
        <h3 className={`font-medium ${titleColor}`}>{title}</h3>
        <span
          className={`flex rounded-full w-6 h-6 text-sm ${titleCountBaground} text-neutral-950 justify-center items-center font-medium`}
        >
          {filteredCards.length}
        </span>
      </div>
      {/* cards */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDragEnd}
        className={`h-full w-full transition-colors ${active ? 'bg-neutral-800/50' : 'bg-neutral-800/0'}`}
      >
        {filteredCards.map((card) => (
          <Card
            key={card.id}
            {...card}
            handleDragStart={handleDragStart}
          />
        ))}
        <DropIndicator
          beforeId={-1}
          column={column}
        />
        <AddCard
          column={column}
          setCards={setCards}
        />
      </div>
    </div>
  );
};

const Card = ({ title, id, column, handleDragStart }) => {
  return (
    <>
      <DropIndicator
        beforeId={id}
        column={column}
      />
      <motion.div
        layout
        layoutId={id}
        draggable={true}
        onDragStart={(e) => handleDragStart(e, { title, id, column })}
        className="cursor-grab active:cursor-grabbing rounded bg-neutral-800 border border-neutral-700 p-3"
      >
        <p className='text-sm text-neutral-100"'>{title}</p>
      </motion.div>
    </>
  );
};

const DropIndicator = ({ beforeId, column }) => {
  return (
    <div
      data-before={beforeId || '-1'}
      data-column={column} // fetch and check for the drop indicators for this column only
      className={`my-0.5 h-0.5 w-full bg-violet-400 transition-all opacity-0`}
    ></div>
  );
};

const Burnbarrel = ({ setCards }) => {
  const [active, setActive] = useState(false);
  const handleDragOver = (e) => {
    e.preventDefault();
    setActive(true);
  };
  const handleDragLeave = () => {
    setActive(false);
  };
  const handleDragEnd = (e) => {
    const cardId = e.dataTransfer.getData('cardId');
    console.log(cardId, '112');
    setCards((prevValue) => prevValue.filter((card) => card.id !== cardId));
    setActive(false);
  };
  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDragEnd}
      className={`mt-10 grid h-56 w-56 border rounded text-3xl shrink-0 place-content-center ${active ? 'border-red-800 bg-red-800/20 text-red-500' : 'border-neutral-500 bg-neutral-500/20 text-neutral-500'}`}
    >
      {active ? <FaFire className="animate-bounce" /> : <FiTrash />}
    </div>
  );
};

const AddCard = ({ column, setCards }) => {
  const [text, setText] = useState('');
  const [adding, setAdding] = useState(false); // show a form if adding or else show the CTA to get the text input form
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim().length) return;
    setCards((prevValue) => [
      ...prevValue,
      { title: text.trim(), id: Math.random().toString(), column: column },
    ]);
    setAdding(false);
  };
  return (
    <>
      {adding ? (
        <motion.form
          layout
          onSubmit={handleSubmit}
        >
          <textarea
            onChange={(e) => {
              setText(e.target.value);
            }}
            placeholder="Add a new task"
            className="w-full rounded border border-violet-400 bg-violet-400/20 p-3 text-sm text-neutral-50 placeholder-violet-300 focus:outline-0"
          >
            {text}
          </textarea>
          <div className="mt-1.5 flex justify-end gap-1.5 items-center">
            <button
              onClick={() => setAdding(false)}
              className="px-3 py-1.5 text-xs text-neutral-400 transition-colors hover:text-neutral-50"
            >
              Close
            </button>
            <button
              type="submit"
              className="flex rounded items-center bg-neutral-50 px-3 py-1.5 text-xs gap-1.5 text-neutral-950 transition-colors hover:bg-neutral-300"
            >
              Add <FaPlus />
            </button>
          </div>
        </motion.form>
      ) : (
        <motion.button
          layout
          className="flex w-full items-center px-3 py-1.5 text-xs gap-1.5 text-neutral-400 transition-colors hover:text-neutral-50"
          onClick={() => setAdding(true)}
        >
          <span>Add card</span> <FaPlus />
        </motion.button>
      )}
    </>
  );
};

// const DEFAULT_CARDS = [
//   // Backlog
//   {
//     title: 'Start working on the Startup All in one app project',
//     id: '1', // why a string ? --
//     column: 'backlog',
//   },

//   {
//     title: 'Add more features to the Startup All in one app project',
//     id: '2',
//     column: 'backlog',
//   },
//   {
//     title: 'Add more features to the Startup All in one app project',
//     id: '3',
//     column: 'backlog',
//   },
//   // Todo
//   {
//     title: 'Add more features to the Startup All in one app project',
//     id: '4',
//     column: 'todo',
//   },
//   {
//     title: 'Add more features to the Startup All in one app project',
//     id: '5',
//     column: 'todo',
//   },
//   {
//     title: 'Add more features to the Startup All in one app project',
//     id: '6',
//     column: 'todo',
//   },

//   // In progress

//   {
//     title: 'Add more features to the Startup All in one app project',
//     id: '7',
//     column: 'doing',
//   },
//   {
//     title: 'Add more features to the Startup All in one app project',
//     id: '8',
//     column: 'doing',
//   },

//   // Done

//   {
//     title: 'Add more features to the Startup All in one app project',
//     id: '9',
//     column: 'done',
//   },
//   {
//     title: 'Add more features to the Startup All in one app project',
//     id: '10',
//     column: 'done',
//   },
// ];
