import React, { Component } from 'react';
import Board from './board';

import './App.css';
import './scss/App.scss';


function StateButtons(props) {
  let playPause = props.runStatus ? "fas fa-pause" : "fas fa-play";
  let disabledBtnCss = props.runStatus ? "btn btn--disabled" : "btn"
  return (
    <div>
      <button onClick={props.handleStartStop} type="button" className="btn"><i className={playPause}></i></button>
      <button onClick={props.handleStep} type="button" className={disabledBtnCss} disabled={props.runStatus}>
        <i className="fas fa-step-forward"></i>
      </button>
      <button onClick={props.handleReset} type="button" className="btn"><i className="fas fa-sync-alt"></i></button>
    </div>

  )
}

function Dropdown(props) {
  return (
    <div>
      <select onChange={props.handleChange} value={props.curValue}>
        {
          props.values.map((value) => {
            return <option key={value} value={value}>{value}</option>
          })
        }
      </select>
    </div>
  )
}

function Range(props) {
  return (
    <input
      className="slider"
      type="range"
      min="0.5"
      max="5"
      step="0.1"
      value={Math.log(2000 / props.curValue)}
      onChange={props.handleChange}
    />
  )
}

function Generations(props) {
  return (
    <table className="generations-display">
      <thead>
        <tr>
          <th>Generations</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{props.generations}</td>
        </tr>
      </tbody>
    </table>
  )
}

function ControlItem(props) {
  let control;

  if (!props.type) {
    console.log("ControlItem Error: No Type");
    return <div></div>
  } else if (props.type === "Slider") {
    control =
    <Range
      curValue={props.value}
      handleChange={props.eventHandler}
    />
  } else if (props.type === "Dropdown") {
    control =
    <Dropdown
      curValue={props.value}
      values={props.values}
      handleChange={props.eventHandler}
    />
  }

  return (
    <div className="ctrls__item">
      <p>{props.label}: </p>
      {control}
    </div>
  )

}

class App extends Component {
  constructor(props) {
    super(props);

    this.BOARDSIZES = {
      Small: {w: 50, h: 30, text: "Small"},
      Medium: {w: 70, h: 50, text: "Medium"},
      Large: {w: 100, h: 80, text: "Large"}
    };

    this.PRESETS = {
      Clear: function(size) {
        return Array(size.h).fill().map(() => Array(size.w).fill(0));
      },
      Block: function(size) {
        let result = this.Clear(size);
        let iMid = size.w / 2;
        let jMid = size.h / 2;

        result[jMid][iMid] = 1;
        result[jMid][iMid + 1] = 1;
        result[jMid + 1][iMid] = 1;
        result[jMid + 1][iMid + 1] = 1;
        return result;
      },
      Random: function(size) {
        let result = this.Clear(size);
        let numActive = Math.floor(Math.random() * size.h * size.w / 2);
        let columns = Array(numActive).fill().map(() => Math.floor(Math.random() * size.w));
        let rows = Array(numActive).fill().map(() => Math.floor(Math.random() * size.h));
        for (let i = 0; i < numActive; i++) {
          result[rows[i]][columns[i]] = 1;
        }
        return result;
      }
    }

    this.state = {
      curSpeed: 500,
      size: "Medium",
      activeCells: this.PRESETS["Random"](this.BOARDSIZES["Medium"]),
      generations: 0,
      runStatus: true,
      currentPattern: "Random"
    };

    this.handleCellClick = this.handleCellClick.bind(this);
    this.handleChangeSize = this.handleChangeSize.bind(this);
    this.handleChangeSpeed = this.handleChangeSpeed.bind(this);
    this.runLifecycle = this.runLifecycle.bind(this);
    this.calculateCellStatus = this.calculateCellStatus.bind(this);
    this.handleChangeStatus = this.handleChangeStatus.bind(this);
    this.handleChangePattern = this.handleChangePattern.bind(this);
    this.handleReset = this.handleReset.bind(this);
    this.handleStep = this.handleStep.bind(this);

  }

  componentDidMount() {
    this.runLifecycle(this.state.curSpeed);
  }

  componentWillUnmount() {
    clearTimeout(this.runInterval);
  }

  runLifecycle(speed, runOnce) {
    var that = this;

    if (checkCells(that.state.activeCells)) {
      this.setState({runStatus: true});
      clearTimeout(that.runInterval);
      lifeCycle();// start running cycle
    }

    function lifeCycle() {
      let activeCells = that.calculateCellStatus(that.state.activeCells, that.BOARDSIZES[that.state.size].h, that.BOARDSIZES[that.state.size].w);
      let generations = that.state.generations;

      // continue lifeCycle if there are still active cells
      if (checkCells(activeCells) && !runOnce) {
        that.runInterval = setTimeout(lifeCycle, that.state.curSpeed);
      } else {
        that.setState({runStatus: false});
      }

      generations++;
      that.setState({activeCells: activeCells, generations: generations});

    }

    function checkCells(cells) {
      /*
      checks input to find active cells-
        return values:
          true if there are active cells
          false if 0 active cells
       */
      return cells.findIndex(function(element) {
        let inner = element.findIndex((elementInner) => elementInner > 0);
        return inner !== -1;
      }) !== -1;
    }

  }

  calculateCellStatus(prevCells, height, width) {
    let nextCells = JSON.parse(JSON.stringify(prevCells));
    for (let j = 0; j < height; j++) {
      for (let i = 0; i < width; i++) {

        let sum = 0;
        for (let y = j - 1; y <= j + 1; y++) {
          for (let x = i - 1; x <= i + 1; x++) {
            if (prevCells[(y + height) % height][(x + width) % width] > 0) {
              sum += 1;
            }
          }
        }
        sum -= prevCells[j][i] === 2 ? 1 : prevCells[j][i];
        if (prevCells[j][i] > 0) {
          // cell is currently alive
          if (sum === 2 || sum === 3) {
            nextCells[j][i] = 2;
          } else {
            nextCells[j][i] = 0;
          }
        } else {
          // cell is currently dead
          if (sum === 3) {
            nextCells[j][i] = 1;
          }
        }

      }
    }
    return nextCells;
  }

  handleChangePattern(option, newSize) {
    clearTimeout(this.runInterval);
    let pattern = option.target ? option.target.value : option;
    let size = newSize || this.state.size;

    let activeCells;

    // failsafe if no pattern in presets
    if (this.PRESETS.hasOwnProperty(pattern)) {
      activeCells = this.PRESETS[pattern](this.BOARDSIZES[size]);
    } else {
      activeCells = this.PRESETS["Clear"](this.BOARDSIZES[size]);
      console.log("Error: Pattern not found");
    }
    this.setState({activeCells: activeCells, currentPattern: pattern, runStatus: false, generations : 0});
  }

  handleCellClick(cell) {
    let activeCells = this.state.activeCells;
    if (activeCells[cell.j][cell.i] === 0) {
      activeCells[cell.j][cell.i] = 1;
    } else {
      activeCells[cell.j][cell.i] = 0;
    }
    this.setState({activeCells: activeCells});
  }

  handleChangeSize(e) {
    clearTimeout(this.runInterval);//clear running lifecycle
    let gridSize = e.target.value;

    //update size if different from current size
    if (gridSize !== this.state.size) {
      this.setState({runStatus: false, size: gridSize, generations: 0});
      this.handleChangePattern("Clear", gridSize);
    }
  }

  handleChangeSpeed(e) {
    // reverse slider allows keyboard input on slider for accessibility
    let speed = 2000 / Math.exp(e.target.value);
    this.setState({curSpeed: speed});
  }

  handleChangeStatus() {
    if (this.state.runStatus) {
      clearTimeout(this.runInterval);
      this.setState({runStatus: false});
    } else {
      this.runLifecycle(this.state.curSpeed);
    }
  }

  handleReset() {
    let activeCells = this.PRESETS[this.state.currentPattern](this.BOARDSIZES[this.state.size]);
    clearTimeout(this.runInterval);
    this.setState({runStatus: false, activeCells: activeCells, generations: 0});
  }

  handleStep() {
    if (!this.state.runStatus) {
      this.runLifecycle(this.state.curSpeed, true);
    }
  }

  render() {
    return (
      <div className="container">
        <div className="ctrls">
          <div className="ctrls__left">
            <StateButtons
              runStatus={this.state.runStatus}
              handleStartStop={this.handleChangeStatus}
              handleReset={this.handleReset}
              handleStep={this.handleStep}
            />
            <Generations generations={this.state.generations} />
          </div>
          <div className="ctrls__right">
            <ControlItem
              label="Speed"
              type="Slider"
              value={this.state.curSpeed}
              eventHandler={this.handleChangeSpeed}
            />
            <ControlItem
              label="Size"
              type="Dropdown"
              value={this.state.size}
              values={Object.keys(this.BOARDSIZES)}
              eventHandler={this.handleChangeSize}
            />
            <ControlItem
              label="Presets"
              type="Dropdown"
              value={this.state.currentPattern}
              values={Object.getOwnPropertyNames(this.PRESETS)}
              eventHandler={this.handleChangePattern}
            />
          </div>
        </div>
        <Board
          size={this.BOARDSIZES[this.state.size]}
          activeCells={this.state.activeCells}
          handleCellClick={this.handleCellClick}
        />
      </div>
    );
  }
}

export default App;
