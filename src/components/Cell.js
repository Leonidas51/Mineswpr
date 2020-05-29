import React from 'react';

function Cell(props) {
  let cell_class = 'cell',
      cell_value;
  
  if (props.open) {
    if (props.hasMine) {
      cell_class += ' cell_mine'
      cell_value = <span className="cell__value cell__value_mine">💣</span>
    } else {
      cell_class += ' cell_open'
      cell_value = <span data-cell-value={props.value} className="cell__value">{props.value || null}</span>
    }
  } else if (props.hasFlag) {
    cell_value = <span className="cell__value cell__value_flag">🚩</span>
  }

  return(
    <div className={cell_class} data-index={props.index}>
      {cell_value}
    </div>
  )
}

export default Cell;