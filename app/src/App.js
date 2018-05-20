import React, { Component } from 'react';
import './App.css';
import './scss/App.scss';


function Button(props) {
  let classes = props.size === "large" ? "btn btn--large" : "btn btn--medium";
  if (props.active) classes += " active";
  return (
    <button className={classes} onClick={props.handleClick}>{props.text}</button>
  )
}

class Board extends React.Component {
  constructor(props) {
    super(props);

    this.cellSize = 10;
    this.cellMargin = 2;

    this.drawSquare = this.drawSquare.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  componentDidUpdate() {
    let drawSquare = this.drawSquare;
    let c = document.getElementById("board-canvas");
    let ctx = c.getContext("2d");
    let canvasWidth = this.props.BOARDSIZES[this.props.size].w * (this.cellSize + this.cellMargin);
    let canvasHeight = this.props.BOARDSIZES[this.props.size].h * (this.cellSize + this.cellMargin);
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    let cells = this.props.activeCells;
    cells.forEach(function(row, rowNum) {
      row.forEach(function(cell, colNum) {
        if (cell > 0) {
          drawSquare(colNum, rowNum, ctx, cell);
        }
      });
    });

  }

  drawSquare(i, j, ctx, cellValue) {
    let positionX = i * (this.cellSize + this.cellMargin);
    let positionY = j * (this.cellSize + this.cellMargin);
    let cellColor = cellValue === 1 ? "orange" : "red";
    ctx.fillStyle = cellColor;
    ctx.fillRect(positionX, positionY, this.cellSize, this.cellSize);
  }

  handleClick(e) {
    let i = Math.floor(e.nativeEvent.offsetX / (this.cellSize + this.cellMargin));
    let j = Math.floor(e.nativeEvent.offsetY / (this.cellSize + this.cellMargin));
    this.props.handleCellClick({i: i, j: j});
  }

  render() {
    let canvasWidth = this.props.BOARDSIZES[this.props.size].w * (this.cellSize + this.cellMargin);
    let canvasHeight = this.props.BOARDSIZES[this.props.size].h * (this.cellSize + this.cellMargin);

    return (
      <canvas id="board-canvas" onClick={this.handleClick} width={canvasWidth} height={canvasHeight} style={{backgroundColor: "grey", padding: "2px"}}></canvas>
    )
  }
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
      Clear: function(array) {
        return array;
      },
      Block: function(array, iMid, jMid) {
        let result = array;
        result[jMid][iMid] = 1;
        result[jMid][iMid + 1] = 1;
        result[jMid + 1][iMid] = 1;
        result[jMid + 1][iMid + 1] = 1;
        return result;
      },
      Random: function(array, iMid, jMid, size) {
        let result = this.generateRandom(this.state.size);
        return result;
      }
    }

    this.state = {
      curSpeed: 500,
      size: "Medium",
      activeCells: this.generateRandom("Medium"),
      generations: 0,
      runStatus: true,
      currentPattern: "Random"
    };

    this.handleCellClick = this.handleCellClick.bind(this);
    this.handleChangeSize = this.handleChangeSize.bind(this);
    this.handleChangeSpeed = this.handleChangeSpeed.bind(this);
    this.generateRandom = this.generateRandom.bind(this);
    this.runLifecycle = this.runLifecycle.bind(this);
    this.calculateCellStatus = this.calculateCellStatus.bind(this);
    this.handleChangeStatus = this.handleChangeStatus.bind(this);
    this.generateClear = this.generateClear.bind(this);
    this.handleChangePattern = this.handleChangePattern.bind(this);

  }

  componentDidMount() {
    this.runLifecycle(this.state.curSpeed);
  }

  componentWillUnmount() {
    clearTimeout(this.runInterval);
  }

  runLifecycle(speed) {
    var that = this;
    function lifeCycle() {
      let activeCells = that.calculateCellStatus(that.state.activeCells, that.BOARDSIZES[that.state.size].h, that.BOARDSIZES[that.state.size].w);
      let generations = that.state.generations;
      // look to see if there are any active cells
      let activeCellsLeft = activeCells.findIndex(function(element) {
        let inner = element.findIndex((elementInner) => elementInner > 0);
        return inner !== -1;
      });
      // clear timer if no active cells
      if (activeCellsLeft !== -1) {
        generations++;
        that.runInterval = setTimeout(lifeCycle, that.state.curSpeed);
      } else {
        clearTimeout(that.runInterval);
        that.setState({runStatus: false});
      }

      that.setState({activeCells: activeCells, generations: generations});

    }

    let activeCellsLeft = this.state.activeCells.findIndex(function(element) {
      let inner = element.findIndex((elementInner) => elementInner > 0);
      return inner !== -1;
    });

    clearTimeout(this.runInterval);

    if (activeCellsLeft !== -1) {
      this.setState({runStatus: true});
      lifeCycle();// start running cycle
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

  handleChangePattern(option) {
    clearTimeout(this.runInterval);
    let pattern = option.target ? option.target.value : option;
    let size= this.state.size;
    let activeCells = this.generateClear(size);
    let iMid = Math.floor(this.BOARDSIZES[size].w / 2);
    let jMid = Math.floor(this.BOARDSIZES[size].h / 2);

    if (this.PRESETS.hasOwnProperty(pattern)) {
      let func = this.PRESETS[pattern].bind(this);
      activeCells = func(activeCells, iMid, jMid);
      console.log(activeCells);
    }
    this.setState({activeCells: activeCells, currentPattern: pattern, runStatus: false, generations : 0});

  }

  generateClear(size) {
    return Array(this.BOARDSIZES[size].h).fill().map(() => Array(this.BOARDSIZES[size].w).fill(0));
  }

  generateRandom(size) {
    let activeCells = this.generateClear(size)
    let numActive = Math.floor(Math.random() * this.BOARDSIZES[size].h * this.BOARDSIZES[size].w / 2);
    let columns = Array(numActive).fill().map(() => Math.floor(Math.random() * this.BOARDSIZES[size].w));
    let rows = Array(numActive).fill().map(() => Math.floor(Math.random() * this.BOARDSIZES[size].h));
    for (let i = 0; i < numActive; i++) {
      activeCells[rows[i]][columns[i]] = 1;
    }
    return activeCells;
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
      let height = this.BOARDSIZES[gridSize].h;
      let width = this.BOARDSIZES[gridSize].w;
      let activeCells = Array(height).fill().map(() => Array(width).fill(0));
      this.setState({runStatus: false, size: gridSize, activeCells: activeCells, generations: 0});
      this.handleChangePattern("Clear")
    }
  }

  handleChangeSpeed(e) {
    // reverse slider allows keyboard input on slider for accessibility
    let speed = 2000 / Math.exp(e.target.value);
    this.setState({curSpeed: speed});
  }

  handleChangeStatus(e) {
    let status = e.target.innerHTML.toLowerCase();
    if (status === "run") {
      this.runLifecycle(this.state.curSpeed);
    } else {
      clearTimeout(this.runInterval);
      this.setState({runStatus: false});
    }
  }

  render() {
    let runStatus = this.state.runStatus ? "Pause" : "Run";
    return (
      <div className="container">
        <div className="ctrls">
          <div className="ctrls__left">
            <Button text={runStatus} size="large" handleClick={this.handleChangeStatus}/>
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
          size={this.state.size}
          BOARDSIZES={this.BOARDSIZES}
          activeCells={this.state.activeCells}
          handleCellClick={this.handleCellClick}
        />
      </div>
    );
  }
}

export default App;
