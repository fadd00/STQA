import React, { useState, useEffect } from "react";

const useDeckOfCards = () => {
  const [deckId, setDeckId] = useState("");
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const shuffleDeck = async () => {
      setLoading(true);
      const response = await fetch(
        "https://www.deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1"
      );
      const data = await response.json();
      setDeckId(data.deck_id);
      setLoading(false);
    };

    shuffleDeck();
  }, []);

  const drawCards = async (count) => {
    if (!deckId) return;
    setLoading(true);
    const response = await fetch(
      `https://www.deckofcardsapi.com/api/deck/${deckId}/draw/?count=${count}`
    );
    const data = await response.json();
    setCards(data.cards);
    setLoading(false);
  };

  return { deckId, cards, drawCards, loading };
};

export default useDeckOfCards;
