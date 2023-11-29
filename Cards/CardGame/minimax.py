import sys

sys.path.append("./CardGame")
from game import Game

def Minimax(move, depth, max_player, game, alpha, beta):
    """
    Minimax algorithm implementation for determining the best move in the card game.
    'move' is the move to be evaluated, 'depth': is the number of moves ahead to search
    'max_player' is a boolean value indicating whether it's the maximizing player's turn,
    'game' contains the object with attributes set to the current the game state, alpha is the
    'alpha' value for alpha-beta pruning, and 'beta' is the beta value for alpha-beta pruning.
    A tuple is returned containing the evaluation score and the best move.
    """
    if depth == 0 or game.GetWinner():
        return game.Eval(), move

    # the max player aims to increase the evaluation score, which is the bot in this case
    if max_player:
        maxEval = float("-inf")
        best_move = None
        for move in game.GetMoves(game.bot):
            copy = Simulate(game, move, True)
            evaluation = Minimax(move, depth - 1, False, copy, alpha, beta)[0]
            maxEval = max(maxEval, evaluation)
            alpha = max(alpha, maxEval)
            if maxEval == evaluation:
                best_move = move
            if beta <= alpha:
                break
        return maxEval, best_move

    else:
        minEval = float("inf")
        best_move = None
        for move in game.GetMoves(game.player):
            copy = Simulate(game, move, False)
            evaluation = Minimax(move, depth - 1, True, copy, alpha, beta)[0]
            minEval = min(minEval, evaluation)
            beta = min(beta, minEval)
            if minEval == evaluation:
                best_move = move
            if beta <= alpha:
                break
        return minEval, best_move


def Simulate(game, move, side):
    """
    Simulates the game state after a move is made.
    'game' contains the object with attributes set to the current the game state, 'move' is the card move
    to be simulated and 'side' is the boolean is True for bot and False for player.
    The method returns the simulated game object after the move.
    """
    copy = Game()
    copy.bot = game.bot.copy()
    copy.enemy = game.enemy.copy()
    copy.turn = side

    try:
        for card in game.player:
            copy.player.append(card.card)
        for card in game.played:
            copy.played.append(card.card)
    except:
        copy.player = game.player.copy()
        copy.played = game.played.copy()

    copy.SimPlay(move)
    return copy