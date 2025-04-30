from flask import Flask, render_template

app = Flask(__name__)

@app.route("/")
@app.route("/home")
@app.route("/home.html")
def home():
    return render_template("home.html")


# ——— Identify ———
@app.route("/identify")
@app.route("/identify.html")
def identify():
    return render_template("identify.html")

@app.route("/identify/questions")
@app.route("/identify/questions.html")
def identify_questions():
    return render_template("identify_questions.html")


# ——— Govern ———
@app.route("/govern")
@app.route("/govern.html")
def govern():
    return render_template("govern.html")

@app.route("/govern/questions")
@app.route("/govern/questions.html")
def govern_questions():
    return render_template("govern_questions.html")


# ——— Control ———
@app.route("/control")
@app.route("/control.html")
def control():
    return render_template("control.html")

@app.route("/control/questions")
@app.route("/control/questions.html")
def control_questions():
    return render_template("control_questions.html")


# ——— Communicate ———
@app.route("/communicate")
@app.route("/communicate.html")
def communicate():
    return render_template("communicate.html")

@app.route("/communicate/questions")
@app.route("/communicate/questions.html")
def communicate_questions():
    return render_template("communicate_questions.html")


# ——— Protect ———
@app.route("/protect")
@app.route("/protect.html")
def protect():
    return render_template("protect.html")

@app.route("/protect/questions")
@app.route("/protect/questions.html")
def protect_questions():
    return render_template("protect_questions.html")


# ——— Report / Overall ———
@app.route("/report")
@app.route("/report.html")
def report():
    return render_template("report.html")


if __name__ == "__main__":
    app.run(debug=True, port=9000)
