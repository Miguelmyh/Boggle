from boggle import Boggle
from flask import Flask, render_template, session, redirect, request, jsonify
from flask_debugtoolbar import DebugToolbarExtension


app = Flask(__name__)
app.config['SECRET_KEY'] = '123'
app.debug = True

toolbar = DebugToolbarExtension(app)

boggle_game = Boggle()


@app.route('/')
def main():
    board = boggle_game.make_board()
    session['board'] = board
    highscore = session.get('highscore', 0)
    tplay = session.get('tplay', 0)
    return render_template('index.html', board=board, tplay=tplay, score=highscore)


@app.route('/check')
def check():
    word = request.args.get('word')
    board = session['board']
    response = boggle_game.check_valid_word(board, word)

    return jsonify({'result': response})


@app.route('/post-score', methods=['POST'])
def post_score():
    score = request.json['score']
    highscore = session.get('highscore', 0)
    tplay = session.get('tplay', 0)

    session['tplay'] = tplay + 1
    session['highscore'] = max(score, highscore)

    return jsonify(brokeRecord=score > highscore)
