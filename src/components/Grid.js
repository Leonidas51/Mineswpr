import React from 'react';
import Cell from './Cell';

const WIDTH = 16;
const HEIGHT = 16;
const SIZE = WIDTH * HEIGHT;

class Grid extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      grid: [],
      started: false,
      locked: false
    }
  }

  componentDidMount() {
    this.initGrid();
  }

  initGrid() {
    const empty_grid = Array(SIZE).fill(null);

    empty_grid.forEach((cell, i, arr) => {
      arr[i] = {
        id: i,
        open: false,
        has_mine: false,
        has_flag: false,
        value: null
      }
    })

    this.setState({
      grid: empty_grid
    })
  }

  fillGrid(safe_cell_id) {
    const mine_cells = this.generateMineArr(this.getNeighborsIds(safe_cell_id, true)),
          grid_cells = this.state.grid;

    grid_cells.forEach((cell, i, arr) => {
      if (mine_cells.indexOf(i) !== -1) {
        cell.has_mine = true;
      }
    })

    this.setState({
      grid: grid_cells
    })
    this.props.startTimer(Date.now());
  }

  generateMineArr(safe_cells) {
    const mine_cells = [];

    while (mine_cells.length < Number(this.props.mines)) {
      let new_mine_pos = this.getRandomInteger(SIZE);
      if (mine_cells.indexOf(new_mine_pos) === -1 && safe_cells.indexOf(new_mine_pos) === -1) {
        mine_cells.push(new_mine_pos);
      }
    }

    mine_cells.sort((a,b) => {
      return a > b;
    });

    return mine_cells;
  }

  getNeighbors(cell_id, include_self) {
    const grid = this.state.grid;
    let group = [];

    if (include_self) {
      group.push(grid[cell_id]);
    }

    // add vertically adjacent
    group.push(grid[cell_id - HEIGHT], grid[cell_id + HEIGHT]);

    // add all adjacent on the left if not on the edge
    if (cell_id % WIDTH !== 0) {
      group.push(grid[cell_id - 1 - WIDTH], grid[cell_id - 1], grid[cell_id - 1 + WIDTH]);      
    }

    // add all adjacent on the right if not on the edge
    if ((cell_id + 1) % WIDTH !== 0) {
      group.push(grid[cell_id + 1 - WIDTH], grid[cell_id + 1], grid[cell_id + 1 + WIDTH]);
    }

    group = group.filter(cell => {
      return cell && (cell.id >= 0) && (cell.id < SIZE)
    })

    group.sort((a,b) => {
      return a.id > b.id;
    });

    return group;
  }

  getNeighborsIds(cell_id, include_self) {
    let group = [];

    if (include_self) {
      group.push(cell_id);
    }

    // add vertically adjacent
    group.push(cell_id - HEIGHT, cell_id + HEIGHT);

    // add all adjacent on the left if not on the edge
    if (cell_id % WIDTH !== 0) {
      group.push(cell_id - 1 - WIDTH, cell_id - 1, cell_id - 1 + WIDTH);      
    }

    // add all adjacent on the right if not on the edge
    if ((cell_id + 1) % WIDTH !== 0) {
      group.push(cell_id + 1 - WIDTH, cell_id + 1, cell_id + 1 + WIDTH);
    }

    group = group.filter(id => {
      return (id >= 0) && (id < SIZE)
    })

    group.sort((a,b) => {
      return a > b;
    });

    return group;
  }

  getRandomInteger(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }

  openCell(index) {
    const grid = this.state.grid;
    let cell_neighbors;

    if (grid[index].has_flag) {
      return;
    }

    if (grid[index].open && grid[index].value !== 0) {
      this.tryChordCell(index);
      return;
    }

    cell_neighbors = this.getNeighbors(index)

    grid[index].open = true;

    if (grid[index].has_mine) {
      this.loseTheGame();
      return;
    }

    grid[index].value = cell_neighbors.filter(cell => cell.has_mine).length;


    if (grid[index].value === 0) {
      this.tryChordCell(index);
    }

    this.setState({
      grid: grid
    })

    this.checkVictory();
  }

  flagCell(index) {
    const grid = this.state.grid;

    if (grid[index].open) {
      this.tryAutoflagCell(index);
      return;
    }

    grid[index].has_flag = !grid[index].has_flag;

    this.setState({
      grid: grid
    })

    this.props.updateMineCount(grid.filter(cell => cell.has_flag).length);
  }

  tryChordCell(index) {
    const grid = this.state.grid,
          cell_neighbors = this.getNeighbors(index);

    if (cell_neighbors.filter(cell => cell.has_flag).length >= grid[index].value) {
      cell_neighbors.forEach(cell => {
        if (!cell.open) {
          this.openCell(cell.id);
        }
      })
    }
  }

  tryAutoflagCell(index) {
    const grid = this.state.grid,
          cell_neighbors = this.getNeighbors(index);
    
    if (cell_neighbors.filter(cell => !cell.open).length === grid[index].value) {
      cell_neighbors.forEach(cell => {
        if (!cell.open && !cell.has_flag) {
          this.flagCell(cell.id)
        }
      })
    }
  }

  checkVictory() {
    const grid = this.state.grid;

    if(grid.filter(cell => !cell.open).length === this.props.mines) {
      this.setState({
        locked: true
      })
      this.props.winTheGame();
    }
  }

  loseTheGame() {
    const grid = this.state.grid;

    grid.forEach(cell => {
      if (cell.has_mine) {
        cell.open = true;
      }
    })

    this.setState({
      grid: grid,
      locked: true
    })
    this.props.loseTheGame();
  }

  onGridMouseUp(e) {
    const clicked_cell = e.target.closest('.cell');
    let clicked_cell_index;

    if (!clicked_cell || this.state.locked) {
      return;
    }

    clicked_cell_index = Number(clicked_cell.dataset.index);

    if (e.button === 0) {
      if (!this.state.started) {
        this.fillGrid(clicked_cell_index);
        this.setState({started: true});
        this.openCell(clicked_cell_index);
        return;
      }

      this.openCell(clicked_cell_index);
    } else if (e.button === 2) {
      this.flagCell(clicked_cell_index);
    }
  }

  onGridMouseDown(e) {
    
  }

  render() {
    return (
      <React.Fragment>
        <div className="grid" onMouseDown={this.onGridMouseDown.bind(this)} onMouseUp={this.onGridMouseUp.bind(this)}>
          {
            this.state.grid.map((cell, i) => {
              return (
                <Cell key={cell.id} index={cell.id} open={cell.open} value={cell.value} hasFlag={cell.has_flag} hasMine={cell.has_mine} />
              )
            })
          }
        </div>
      </React.Fragment>
    )
  }
}

export default Grid;