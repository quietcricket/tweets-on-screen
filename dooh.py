from flask import Flask, render_template

flapp = Flask('twitter-dooh')


@flapp.route('/screen')
def display_tweets():
    pass


@flapp.route('/pick')
def pick_tweets():
    return render_template("pick.html")




if __name__ == "__main__":
    flapp.run(port=8080, debug=True)
