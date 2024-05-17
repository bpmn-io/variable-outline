import './bottom-panel.css';
import ReactComponent from '../../lib';

export const BottomPanel = ({ injector }) => {

  return (
    <>
      <div className="bottom-panel"></div>
      <ReactComponent injector={ injector } />
    </>
  );
};
