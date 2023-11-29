import pygame, random, sys

sys.path.append("./CardGame")
from cardRules import *


class Constants:
    def __init__(self):
        self.ranks = ["2", "A", "K", "Q", "J"] + [str(i) for i in range(10, 2, -1)]
        self.suits = ["H", "D", "C", "S"]
        self.cards = []

        # creates all 52 cards
        for rank in self.ranks:
            for suit in self.suits:
                self.cards.append(rank + suit)

        self.imgs = []

        for i in self.cards:
            card = pygame.image.load("Assets/" + i + ".png")
            self.imgs.append(card)

        self.imgs.append(pygame.image.load("Assets/card.png"))

    def GetImg(self, card):
        """
        Method will return the image object of whatever card is represented by
        the 'card' string. E.g. of a card representation is 2H for 2 of hearts.
        """
        if card == "card":
            return self.imgs[-1]
        return self.imgs[self.cards.index(card)]


class Card:
    def __init__(self, x, y, width, height, card):
        self.card = card
        self.x = x
        self.y = y
        self.width = width
        self.height = height
        self.img = pygame.transform.scale(
            Constants().GetImg(card), (self.width, self.height)
        )
        self.select = False
        self.played = False

    def Draw(self, win):
        """
        Draws the card image to the x and y coordinates onto the 'win'
        object, which is the pygame object representing the screen.
        """
        win.blit(self.img, (self.x, self.y))

    def Select(self):
        """
        Method deals with whether the player has pressed the card itself by
        checking if the mouse is on top of the card. It will then toggle the
        select attribute whenever the card has been pressed.
        Will return true if the card has been pressed.
        """
        if self.played == False:
            mouse = pygame.mouse.get_pos()
            if mouse[0] >= self.x and mouse[0] <= self.x + self.width:
                if mouse[1] >= self.y and mouse[1] <= self.y + self.height:
                    if self.select:
                        self.select = False
                        self.y += 50
                    else:
                        self.select = True
                        self.y -= 50
                    return True
            return False


class Game:
    def __init__(self):
        self.cards = Constants().cards.copy()
        self.played = []
        self.game = Thirteens()
        self.player = []
        self.bot = []
        self.turn = False
        self.winner = ""
        self.enemy = []
        self.begin = True

    def GetWinner(self):
        """
        Method determines which player has won the game by checking
        which of them has no cards remaining in their hand.
        Returns 'player' is the user won.
        """
        if len(self.player) == 0:
            return "player"
        elif len(self.bot) == 0:
            return "bot"

    def Won(self):
        """
        Method will determine attributes that should be set depending on which
        player has won.
        """
        winner = self.GetWinner()

        # if the player has won, the enemy's cards will be displayed
        if winner == "player":
            self.winner = "player"
            self.turn = None
            for i, card in enumerate(self.enemy):
                self.enemy[i] = Card(card.x, card.y, 75, 75, self.bot[i])

        elif winner == "bot":
            self.winner = "bot"
            self.turn = None

    def DealCards(self):
        """
        Method deals with randonly handling cards out both the bot and to the player.
        """
        cardsP = []

        # randomly assign 13 cards to the bot
        for _ in range(13):
            choice = random.randrange(0, len(self.cards))
            self.bot.append(self.cards.pop(choice))

        # randomly assign 13 cards to the player represented as 'cardsP'
        for _ in range(13):
            choice = random.randrange(0, len(self.cards))
            cardsP.append(self.cards.pop(choice))

        # sort the cards from greatest playing value to lowest
        # as the cards will be displayed to player in this way
        cardsP = sorted(cardsP, key=self.game.sortPlay, reverse=True)
        self.bot = sorted(self.bot, key=self.game.sortPlay, reverse=True)

        # translate the player's cards in cardsP to a Card object and assign self.player
        # which is responsible for holding the cards that will be displayed to the screen
        for i, card in enumerate(cardsP):
            self.player.append(Card(i * 75, 525, 75, 75, card))

        # the enemy's cards cannot be seen by the player so, initially, when drawn,
        # they should appear as the back of a card
        for i in range(len(self.bot)):
            self.enemy.append(Card(i * 75, 0, 75, 75, "card"))

        # determines who should begin the game by determining which player has the card
        # of the lowest value
        if self.begin:
            if self.game.IsGreater(cardsP[0], self.bot[0]):
                self.turn = True
            else:
                self.turn = False

    def Eval(self):
        """
        Method determines which player is in a better position by the amount of cards they
        hold. Is used by Minimax algorithm to determine which move to make.
        Returns an integer representing the difference in the cards held by player vs bot.
        """
        return len(self.player) - len(self.bot)

    def GetBomb(self, side):
        """
        Method extracts all possible and valid 'bomb' moves by considering the cards that are
        held in the 'side' list and what cards has already been played. Note there are two 
        possible ways to form a bomb, 4 cards of the same rank, or 2 cards of the same rank,
        with 2 cards of same rank but higher by 1 then the last two cards, and another two cards
        of same rank but higher by 1 then last two cards, which can be as long as possible.
        'side' is a list containing all cards currently held in any given hand.
        Will return an array of all possible bomb moves. 
        """
        bombs = []
        possiBomb = []
        try:
            played = [i.card for i in self.played]
        except:
            played = self.played
        try:
            side = [i.card for i in side]
        except:
            pass

        for i, card in enumerate(side[::-1]):
            # deals with searching for a bomb where 4 cards are of the same rank
            if i < len(side) - 3:
                # if a valid bomb and been found and is a valid play against what has already been played
                # then it should be considered a possibe move
                play = [card, side[::-1][i + 1], side[::-1][i + 2], side[::-1][i + 3]]
                if self.game.IsBomb(play) and self.game.IsValid(play, played):
                    bombs.append(play)

            if possiBomb:
                # if statement checks if the current card is consecutive with the last card in possiBomb
                if (len(possiBomb) - 1) % 2 != 0:
                    # check if the current card's rank is consecutive to the last card in possiBomb
                    if (
                        self.game.ranks.index(card[:-1])
                        == self.game.ranks.index(possiBomb[-1][:-1]) + 1
                    ):
                        possiBomb.append(card)
                    # if current card's rank is not consecutive, reset possiBomb with the current card
                    elif card[:-1] != possiBomb[-1][:-1]:
                        possiBomb = [card]
                # else checks for a pair of cards of the same rank
                else:
                    # checks if the last card of possiBomb is of the same rank as card
                    if card[:-1] == possiBomb[-1][:-1]:
                        possiBomb.append(card)
                    else:
                        possiBomb = [card]
            else:
                possiBomb.append(card)

            # if the set of cards in possiBomb is a bomb then check if it can be played against what has
            # already been played
            if self.game.IsBomb(possiBomb):
                if played:
                    if self.game.IsValid(possiBomb, played):
                        bombs.append(possiBomb)
                        # a copy is created so that the loop can continute to create a bigger bomb if possible
                        possiBomb = possiBomb.copy()
                    # if the below condition is true that means that the played list contains a bomb and that
                    # creating a larger bomb has failed
                    elif len(possiBomb) >= len(played):
                        possiBomb = []
                else:
                    bombs.append(possiBomb)
                    possiBomb = possiBomb.copy()

        return bombs

    def GetCombo(self, side):
        """
        Method extracts all possible and valid 'combo' moves by considering the cards that are
        held in the 'side' list and what cards has already been played. A combo is a set of 
        cards of consecutive rank which can be as long as possible.
        'side' is a list containing all cards currently held in any given hand.
        Will return an array of all possible combo moves.  
        """
        moves = []
        possiCombos = []
        try:
            played = [i.card for i in self.played]
        except:
            played = self.played
        try:
            side = [i.card for i in side]
        except:
            pass

        for card in side[::-1]:
            # a combo cannot contain a 2
            if card[:-1] != "2":
                if possiCombos:
                    # append the current card if consecutive to last card in possiCombos
                    if (
                        self.game.ranks.index(card[:-1])
                        == self.game.ranks.index(possiCombos[-1][:-1]) + 1
                    ):
                        possiCombos.append(card)
                    elif card[:-1] != possiCombos[-1][:-1]:
                        possiCombos = [card]
                else:
                    possiCombos.append(card)

            if self.game.IsCombo(possiCombos):
                if self.played:
                    # checks that the possible combo that was found can actually be played against what has
                    # already been played
                    if self.game.IsValid(possiCombos, played):
                        moves.append(possiCombos)
                        possiCombos = possiCombos.copy()
                    elif len(possiCombos) >= len(played):
                        possiCombos = []
                else:
                    moves.append(possiCombos)
                    possiCombos = possiCombos.copy()

        return moves

    def GetTriple(self, side):
        """
        Method extracts all possible and valid 'triple' moves by considering the cards that are
        held in the 'side' list and what cards has already been played. A triple is one where 3
        cards are of the same rank.
        'side' is a list containing all cards currently held in any given hand.
        Will return an array of all possible triple moves.  
        """
        moves = []
        try:
            played = [i.card for i in self.played]
        except:
            played = self.played
        try:
            side = [i.card for i in side]
        except:
            pass

        for i, card in enumerate(side[::-1]):
            if i < len(side) - 2:
                play = [card, side[::-1][i + 1], side[::-1][i + 2]]
                if self.game.IsTriple(play) and self.game.IsValid(play, played):
                    moves.append(play)
        return moves

    def GetDouble(self, side):
        """
        Method extracts all possible and valid 'double' moves by considering the cards that are
        held in the 'side' list and what cards has already been played. A double is one where 3
        cards are of the same rank.
        'side' is a list containing all cards currently held in any given hand.
        Will return an array of all possible double moves.  
        """
        moves = []
        try:
            played = [i.card for i in self.played]
        except:
            played = self.played
        try:
            side = [i.card for i in side]
        except:
            pass

        for i, card in enumerate(side[::-1]):
            if i < len(side) - 1:
                if played:
                    if i < len(side) - 3 and played[0][:-1] == "2":
                        play = [
                            card,
                            side[::-1][i + 1],
                            side[::-1][i + 2],
                            side[::-1][i + 3],
                        ]
                        if self.game.IsBomb(play) and self.game.IsValid(play, played):
                            moves.append(play)

                play = [card, side[::-1][i + 1]]
                if self.game.IsDouble(play) and self.game.IsValid(play, played):
                    moves.append(play)

        return moves

    def GetMoves(self, side):
        """
        Method extracts all possible moves considering the cards held in side and the cards
        that have already been played.
        'side' is a list containing all cards currently held in any given hand.
        Returns an array of every single possible move which can be played.  
        """
        moves = []
        try:
            played = [i.card for i in self.played]
        except:
            played = self.played

        try:
            side = [i.card for i in side]
        except:
            pass

        if not (self.played):
            for move in self.GetCombo(side):
                if self.begin:
                    if self.bot[0] in move:
                        moves.append(move)
                else:
                    moves.append(move)

            for move in self.GetTriple(side):
                if self.begin:
                    if self.bot[0] in move:
                        moves.append(move)
                else:
                    moves.append(move)

            for move in self.GetDouble(side):
                if self.begin:
                    if self.bot[0] in move:
                        moves.append(move)
                else:
                    moves.append(move)

            for move in self.GetBomb(side):
                if self.begin:
                    if self.bot[0] in move:
                        moves.append(move)
                else:
                    moves.append(move)

            for card in side[::-1]:
                if self.begin:
                    if self.bot[0] == card:
                        moves.append([card])
                else:
                    moves.append([card])

        if self.game.IsCombo(played):
            moves = self.GetCombo(side)

        elif self.game.IsTriple(played):
            moves = self.GetTriple(side)

        elif self.game.IsDouble(played):
            moves = self.GetDouble(side)

        elif self.game.IsBomb(played):
            for bomb in self.GetBomb(side):
                if len(bomb) == len(self.played):
                    moves.append(bomb)

        elif len(self.played) == 1:
            if played[:-1] == "2":
                for bomb in self.GetBomb(side):
                    if self.game.IsValid(bomb, played):
                        moves.append(bomb)

            for card in side[::-1]:
                if self.game.IsValid([card], played):
                    moves.append([card])

        if moves:
            return moves

        # if no possible moves found then player holding the hand containing 'side' must pass
        return ["pass"]

    def Play(self, play):
        """
        Method faciliates all the actions that must occur after a player has played a hand.
        'play' is an array of cards that the player has chosen the play.
        Returns a boolean value indicating that the play was valid.
        """
        played = [i.card for i in self.played]

        # this means that it is the bot's turn
        if self.turn:
            if play == "s" or play == "pass":
                self.played = []
                self.turn = False

            elif self.game.IsValid(play, played):
                display = []
                startX = 500 - (75 * len(play)) // 2
                # randomly remove, visually, the same number of cards from the bot's hand to what the bot actually
                # played so that it is impossible for the user cannot guess what cards the bot actually holds
                for i, card in enumerate(play):
                    choice = self.enemy.index(random.choice(self.enemy))
                    self.enemy.pop(choice)
                    x = startX + 75 * i
                    y = 300 - (75 / 2)
                    display.append(Card(x, y, 75, 75, card))
                    self.bot.pop(self.bot.index(card))

                self.played = display
                self.turn = False

            self.begin = False

        # deals with logic of the user's turn
        elif self.turn == False:
            if play == "pass":
                # if it is the beginning of the game or of a round and it is the bot's turn the bot cannot pass
                if self.begin == False and self.played:
                    self.played = []
                    self.turn = True
                    return True
                else:
                    return False

            else:
                playCards = [i.card for i in play]
                playedCards = [i.card for i in self.played]
                # if it is the beginning of the game and the player did not play their lowest card in their play
                # then their play is invalid
                if self.begin and self.player[0].card not in playCards:
                    return False

                self.begin = False

                if self.game.IsValid(playCards, playedCards):
                    # if the user's move was valid, visually remove the cards from the user's hand
                    # that has just been played
                    startX = 500 - (play[0].width * len(play)) // 2
                    for i, card in enumerate(play):
                        card.x = startX + 75 * i
                        card.y = 300 - card.height / 2
                        self.player.pop(self.player.index(card))

                    self.played = play
                    self.turn = True
                    return True

                return False

    def SimPlay(self, play):
        """
        Method faciliates all the actions that must occur after a player has played a hand in algorithm's
        simulation. This method is used when the Minimax algorithm examines all possible plays that the
        player and itself can make to determine the best course of action against the current hand.
        'play' is an array of cards that the player has chosen the play.
        Returns a boolean value indicating that the play was valid.
        """
        if play == "s" or play == "pass":
            self.played = []
            self.turn = not (self.turn)

        elif self.turn:
            if self.game.IsValid(play, self.played):
                for card in play:
                    self.bot.pop(self.bot.index(card))
                self.played = play
            self.turn = False

        elif self.turn == False:
            if self.game.IsValid(play, self.played):
                for card in play:
                    self.player.pop(self.player.index(card))
                self.played = play
            self.turn = True