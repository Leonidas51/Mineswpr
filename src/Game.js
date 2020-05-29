import React from 'react';
import Grid from './components/Grid';
import './style.css';
import Victory from "./images/victory.jpg";
import { render } from 'react-dom';

const MINES = 40;

class Game extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      victory: false,
      game_timer: 0,
      mine_count: MINES,
      grid_refresh_key: Date.now()
    }
  }

  componentDidMount() {
    window.oncontextmenu = () => {return false};
  }

  startTimer(start) {
    this.timer = setInterval(() => {
      this.setState({
        game_timer: Math.round((Date.now() - start) / 1000)
      })
    }, 1000)
  }

  stopTimer() {
    clearInterval(this.timer);
  }

  resetTimer() {
    clearInterval(this.timer);
    this.setState({
      game_timer: 0
    })
  }

  updateMineCount(flags) {
    this.setState({
      mine_count: MINES - flags
    })
  }

  loseTheGame() {
    this.stopTimer();
  }

  restartTheGame() {
    this.resetTimer();
    this.setState({
      grid_refresh_key: Date.now(),
      mine_count: MINES
    })
  }

  winTheGame() {
    this.stopTimer();
    this.setState({
      victory: true
    })
  }

  render() {
    return (
      <div className="game">
        <Grid
          key={this.state.grid_refresh_key}
          mines={MINES}
          updateMineCount={this.updateMineCount.bind(this)}
          startTimer={this.startTimer.bind(this)}
          loseTheGame={this.loseTheGame.bind(this)}
          winTheGame={this.winTheGame.bind(this)}
        />
        <div className="sidemenu">
          <div className="sidemenu__title">Mineswpr</div>
          <div className="sidemenu__counters">
            <div className="sidemenu__counter">{this.state.mine_count}</div>
            <div className="sidemenu__counter">{this.state.game_timer}</div>
          </div>
          <div className="sidemenu__restart">
            <button className="sidemenu__restart-btn" onClick={this.restartTheGame.bind(this)}>Restart ↻</button>
          </div>
          {
            this.state.victory
            ? (
                <div className="victory-image-container">
                  <img className="victory-image" src={Victory} />
                </div>
              )
            : null
          }
        </div>
      </div>
    );
  }
}

export default Game;
