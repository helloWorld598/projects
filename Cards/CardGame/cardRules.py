class Thirteens:
    def __init__(self):
        self.ranks = ["2", "A", "K", "Q", "J"] + [str(i) for i in range(10, 2, -1)]
        self.suits = ["H", "D", "C", "S"]

    def sortPlay(self, card):
        """
        Method is a sorting key used to compare cards by comparing first by rank but if 
        ranks are equal then is compared by suit.
        Returns an integer indicating how high it should appear on a sorted list.
        """
        return self.ranks.index(card[:-1]) + self.suits.index(card[-1]) / 10

    def IsValid(self, play, prev):
        """
        Method checks whether a play is valid compared to the previous play.
        Returns true if the player is valid.
        """
        play = sorted(play, key=self.sortPlay)
        prev = sorted(prev, key=self.sortPlay)

        # if it is the beginning of the round and no play has been yet then
        # any play is allowed to be made as long as it follows the below rules
        if not (prev):
            if (
                len(play) == 1
                or self.IsDouble(play)
                or self.IsTriple(play)
                or self.IsCombo(play)
                or self.IsBomb(play)
            ):
                return True

        # if the previous play was a bomb and the current play is also a bomb and their lengths of play
        # or equal, compare which is higher by selecting the first card, which will always be the higher card
        if self.IsBomb(play) and self.IsBomb(prev) and len(play) == len(prev):
            return self.IsGreater(play[0], prev[0])

        # if the previous card play was a single card
        if len(prev) == 1:
            # if the last card play as a 2 then any bomb can be used to beat it
            if prev[0][:-1] == "2" and self.IsBomb(play):
                return True
            # otherwise any single card higher then previous card is valid
            elif len(play) == 1:
                return self.IsGreater(play[0], prev[0])
            else:
                return False

        # if the previous card play was a double
        elif len(prev) == 2:
            # if a double 2 was played and a bomb of length four was played then it will beat the double 2
            if self.IsBomb(play) and len(play) == 4 and prev[0][:-1] == "2":
                return True
            return self.IsDouble(play) and self.IsGreater(play[0], prev[0])

        # otherwise at this point if the two plays are not equal lengths they are not valid
        elif len(play) != len(prev):
            return False

        # this means that either a triple was played or a combo which must be at least length 3
        elif len(prev) >= 3:
            # if a triple was played a higher triple is all that is needed to defeat the last triple
            if self.IsTriple(prev):
                return self.IsTriple(play) and self.IsGreater(play[0], prev[1])
            # otherwise a combo was played so the current play must be a combo whose highest card in the combo 
            # must be higher than the highest card in the last combo
            else:
                return self.IsGreater(play[0], prev[0]) and self.IsCombo(play)

        return False

    def IsGreater(self, card1, card2):
        """
        Method checks whether card1, where card1 is single, is of a greater value than card2, where card2 is single.
        Returns true if card1 is of a greater value than card2. 
        """
        rank1 = self.ranks.index(card1[:-1])
        rank2 = self.ranks.index(card2[:-1])
        # compare ranks first
        if rank1 < rank2:
            return True
        elif rank1 > rank2:
            return False
        else:
            # otherwise if ranks are equal compare suits
            suit1 = self.suits.index(card1[-1])
            suit2 = self.suits.index(card2[-1])

            if suit1 < suit2:
                return True
            else:
                return False

    def IsDouble(self, play):
        """
        Method checks if a valid double was played which are two cards of same rank.
        'play' is a list of cards that is to be checked.
        Returns true if a valid double is played.
        """
        if len(play) == 2:
            if play[0][:-1] == play[1][:-1]:
                return True
        return False

    def IsTriple(self, play):
        """
        Method checks if a valid triple was played which are three cards of same rank.
        'play' is a list of cards that is to be checked.
        Returns true if a valid double is played.
        """
        if len(play) == 3:
            if play[0][:-1] == play[1][:-1] and play[0][:-1] == play[2][:-1]:
                return True
        return False

    def IsCombo(self, play):
        """
        Method checks if a valid combo was played which are at least 3 consecutive cards.
        'play' is a list of cards that is to be checked.
        Returns true if a valid double is played.
        """
        if "2H" in play or "2D" in play or "2C" in play or "2S" in play:
            return False

        play = sorted(play, key=self.sortPlay)

        if len(play) > 2:
            index = -1

            for card in play:
                cardR = self.ranks.index(card[:-1])

                if index == -1:
                    index = cardR
                elif cardR == index + 1:
                    index = cardR
                else:
                    return False
        else:
            return False

        return True

    def IsBomb(self, play):
        """
        Method checks if a valid bomb was played which are four cards of same rank or 
        two cards of the same rank then another two of consecutive ranks.
        'play' is a list of cards that is to be checked.
        Returns true if a valid double is played.
        """
        if "2H" in play or "2D" in play or "2C" in play or "2S" in play:
            return False

        if len(play) == 4:
            if (
                play[0][:-1] == play[1][:-1]
                and play[2][:-1] == play[3][:-1]
                and play[0][:-1] == play[3][:-1]
            ):
                return True

        elif len(play) >= 6:
            play = sorted(play, key=self.sortPlay)
            index = -1

            for n, card in enumerate(play):
                cardR = self.ranks.index(card[:-1])

                if index == -1:
                    index = cardR

                elif n % 2 == 0:
                    if index + 1 == cardR:
                        index = cardR
                    else:
                        return False

                elif index != cardR:
                    return False

            if len(play) % 2 == 0:
                return True
            else:
                return False


def Test():
    """
    Method is used to during testing to make sure that the card rules were implemented 
    properly without error.
    """
    rules = Thirteens()
    play = input("Enter a card: ").split()
    played = []
    while play:
        if play == ["free"]:
            played = []
        elif rules.IsValid(play, played):
            played = sorted(play, key=rules.sortPlay)
        else:
            print("Not valid play")
        print(played)
        play = input("Enter a card: ").split()