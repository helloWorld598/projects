from CardGame.game import *
from CardGame.minimax import Minimax
import pygame, sys


win = pygame.display.set_mode((1000, 600))
clock = pygame.time.Clock()


def draw(win, cards, played, enemy):
    """
    Function will draw the cards that the player possesses, the cards that 
    have been played on the screen, and the number of cards possessed by 
    the opponent, onto the screen. Win is the window object that pygame will
    draw the cards to, cards is an list of cards the player has, played is
    a list of the cards that has been played and enemy is a list of cards
    the enemy holds.
    """
    win.fill((255, 255, 255))
    for card in cards:
        card.Draw(win)
    for card in played:
        card.Draw(win)
    for card in enemy:
        card.Draw(win)
    pygame.display.update()


def main():
    """
    Function deals with player inputs, drawing to the screen and faciliating
    the rules of the game and actions of the bot.
    """
    run = True
    gameHelper = Game()
    play = []
    gameHelper.DealCards()
    starter = gameHelper.turn

    while run:
        clock.tick(60)

        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                run = False
                pygame.quit()
                sys.exit()

            # event that deals with the mouse button being pressed
            elif event.type == pygame.MOUSEBUTTONDOWN:
                for card in gameHelper.player:
                    # if a card has been pressed and if is not already selected
                    # then should 'pop up'
                    # otherwise it should be lowered
                    if card.Select():
                        if card.select:
                            play.append(card)
                        else:
                            play.pop(play.index(card))

            # event deals with a key being pressed
            elif event.type == pygame.KEYDOWN:
                # if it is the player's turn and the return key is pressed
                # then play the selected cards
                if event.key == pygame.K_RETURN and play:
                    if gameHelper.Play(play):
                        play = []

                # pressing the p key makes the player pass
                elif event.key == pygame.K_p:
                    gameHelper.Play("pass")

                # pressing the r key to start a brand new game
                elif event.key == pygame.K_r:
                    play = []
                    winner = gameHelper.winner
                    gameHelper = Game()

                    gameHelper.DealCards()
                    if winner:
                        gameHelper.begin = False
                    else:
                        gameHelper.turn = starter

                    if winner == "bot":
                        gameHelper.turn = True
                        starter = True
                    elif winner == "player":
                        gameHelper.turn = False
                        starter = False

        draw(win, gameHelper.player, gameHelper.played, gameHelper.enemy)

        # if it is the bot's turn then activate the minimax algorithm so
        # the bot can predict the best move
        if gameHelper.turn:
            _, move = Minimax(
                "pass",
                7,
                True,
                gameHelper,
                float("-inf"),
                float("inf"),
            )
            gameHelper.Play(move)

        gameHelper.Won()

    pygame.quit()


main()