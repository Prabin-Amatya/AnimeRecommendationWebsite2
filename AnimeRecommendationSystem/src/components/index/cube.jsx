import '../../static/cube.css'
import '../../static/cuberotation.css'
import '../../static/index.css'
import { useEffect, useState } from 'react';
import { useQueryForSearch, useSpecificQuery } from '../../hooks';
import API_URLS from '../../config';
import AnimeList from './animeList';
import Favorites from './favorites';

function handleOnClick({setRecommendClicked, refetch}){
  if (refetch){
    refetch()
    document.getElementById("chargeAudio").play()
  }
  var sides = ['u','f','r','l','b','d'];
  var face = ['1','2','3']
  var moves_forward = []
  var prevside = ''
  for(let i=0; i<10; i++){
    var chosen_side = prevside
    while(chosen_side == prevside) {
      
      var side_index = Math.floor(Math.random()*sides.length)
      chosen_side = sides[side_index]
    }
    prevside = chosen_side
    var face_index = Math.floor(Math.random()*face.length)
    var chosen_face = face[face_index]
    moves_forward.push(chosen_side+chosen_face)
  }

  var moves_backward = moves_forward.slice().reverse().map((move)=>{
    var side = move[0]
    var face = move[1]
    var newface = 4-parseInt(face)
    newface = newface.toString()
    return side+newface
  })

  var moves=[...moves_forward, ...moves_backward]
  var movesLength = moves.length
  var moveIndex = 0
  var stop=false
  var layers = {
    u: {corners: [0, 1, 3, 2], edges: [0, 1, 3, 2]},
    f: {corners: [1, 0, 4, 5], edges: [0, 8, 4, 9]},
    r: {corners: [0, 2, 6, 4], edges: [6, 8, 2, 10]},
    l: {corners: [3, 1, 5, 7], edges: [1, 9, 5, 11]},
    b: {corners: [2, 3, 7, 6], edges: [3, 11, 7, 10]},
    d: {corners: [4, 6, 7, 5], edges: [4, 6, 7, 5]}
  };
  
  setRecommendClicked(true)
  /** Adds classNamees to cubies to start animation. */
  function move(turn) {
     // turn examples: 'r1', 'd2', 'u3'
    if(stop)return
    var side = turn[0];
    var layer = layers[side];
    var m = document.querySelector('.cubie-middle-' + side);
    var cubies = [m.parentNode];
    for(var i=0; i<layer.corners.length; ++i) {
      var c = document.querySelector('.cubie-corner-position-' + layer.corners[i]);
      cubies.push(c.parentNode);
    }
    for(var i=0; i<layer.edges.length; ++i) {
      var e = document.querySelector('.cubie-edge-position-' + layer.edges[i]);
      cubies.push(e.parentNode);
    }
    for(var i=0; i<cubies.length; ++i) {
      cubies[i].classList.add('turn');
      cubies[i].classList.add('turn-' + turn);
    }
  }
  
  
  /**	Updates classNamees of cubie. This should be called on completion of
    animation for every cubie that was involved in animation. */
  function updateCubie() {
    var match = this.className.match(/turn\-(..)/);
    this.classList.remove('turn');
    if (match==null) return 
    this.classList.remove(match[0]);
    
    var step = +match[1][1];
    var side = match[1][0];
    var layer = layers[side];
    var div = this.children[0];
    
    var re = /(cubie-corner-position-)(\d+)/;
    if(match = div.className.match(re)) {
      var idx = layer.corners.indexOf(+match[2]);
      var newVal = layer.corners[(idx + step)&3];
      div.className = div.className.replace(re, '$1' + newVal);
      
      div = div.children[0];
      re = /(cubie-corner-orientation-)(\d+)/;
      match = div.className.match(re);
      newVal = (+match[2] + (side!='u' && side!='d') * (step&1) * (1+(idx&1))) % 3;
      div.className = div.className.replace(re, '$1' + newVal);
    }
    
    re = /(cubie-edge-position-)(\d+)/;
    if(match = div.className.match(re)) {
      var idx = layer.edges.indexOf(+match[2]);
      var newVal = layer.edges[(idx + step)&3];
      div.className = div.className.replace(re, '$1' + newVal);
      
      div = div.children[0];
      re = /(cubie-edge-orientation-)(\d+)/;
      match = div.className.match(re);
      newVal = +match[2]^(side=='f' || side=='b')&step;
      div.className = div.className.replace(re, '$1' + newVal);
    }
  }
  
  
  /**	Generates and executes random move */
  var nextMove = function() {
    if (stop) return
    // var sides = ['u','f','r','l','b','d'];
    return function() {
      if(document.querySelector('.cube-layer.turn')) return;
      setTimeout(function() {
        move(moves[moveIndex])
        moveIndex = moveIndex+1
        if (moveIndex>=movesLength){
          moveIndex = 0
          stop=true;
          var layerDivs = document.querySelectorAll('.cube-layer');
          for(var i=0; i<layerDivs.length; ++i) {
            layerDivs[i].removeEventListener('transitionend', updateCubie);
            layerDivs[i].removeEventListener('transitionend', nextMove);    
          }
          
          setRecommendClicked(false)
        }
      }, 10);
      
    };
  }();
  
  
  function setupTransitionListeners() {
    // Add transitionend listeners for updating classNames and starting the next move
    var layerDivs = document.querySelectorAll('.cube-layer');
    for (var i = 0; i < layerDivs.length; ++i) {
      layerDivs[i].addEventListener('transitionend', updateCubie, true);
      layerDivs[i].addEventListener('transitionend', nextMove, true);
    }
  }

  setupTransitionListeners()
  
  // start the first move
  nextMove();
}

const Cube = ({user, setMessage}) => {
  const [recommendClicked, setRecommendClicked] = useState(false)
  const [dragging, setDrag] = useState(false)
  const [showFavorite, setShowFavorite] = useState(false)
  const [rot, setRot] = useState({
    x:0,y:0,z:0
  })

  const [search, setSearch] = useState("")
  const [posts, postQueries] = useSpecificQuery(API_URLS.recommendation, "recommendation")
  
  const [currAnime, setCurrAnime] = useState(null)
  var imageView = recommendClicked? 'none': 'block'
  const [delta, setDelta] = useState({ x: 0, y: 0 }); 
  const [showAddToFavorite, setShowAddToFavorite] = useState(false)

  useEffect(()=>{
    handleOnClick({setRecommendClicked, "refetch": null})
  }, [])

  function extract(m) { // supports only scale*rotate*translate matrix
    var radians = Math.PI / 180

    var sX = Math.sqrt(m[0]*m[0] + m[1]*m[1] + m[2]*m[2]),
        sY = Math.sqrt(m[4]*m[4] + m[5]*m[5] + m[6]*m[6]),
        sZ = Math.sqrt(m[8]*m[8] + m[9]*m[9] + m[10]*m[10])

    var rX = Math.atan2(-m[9]/sZ, m[10]/sZ) / radians,
        rY = Math.asin(m[8]/sZ) / radians,
        rZ = Math.atan2(-m[4]/sY, m[0]/sX) / radians

    if (m[4] === 1 || m[4] === -1) {
      rX = 0
      rY = m[4] * -Math.PI/2
      rZ = m[4] * Math.atan2(m[6]/sY, m[5]/sY) / radians
    }

    var tX = m[12]/sX,
        tY = m[13]/sX,
        tZ = m[14]/sX

    return {
      translate: [tX, tY, tZ],
      rotate: [rX, rY, rZ],
      scale: [sX, sY, sZ]
    }
}

  const handleDown = (e) =>{
    setDelta({
        x: e.pageX,
        y: e.pageY
    });
        
    const cube = document.querySelector("#mainCube");
    const cubestyle = window.getComputedStyle(cube);
    const matrix = new DOMMatrix(cubestyle.transform);

    var sX = Math.sqrt(matrix.m11 * matrix.m11 + matrix.m12 * matrix.m12 + matrix.m13 * matrix.m13),
    sY = Math.sqrt(matrix.m21 * matrix.m21 + matrix.m22 * matrix.m22 + matrix.m23 * matrix.m23),
    sZ = Math.sqrt(matrix.m31 * matrix.m31 + matrix.m32 * matrix.m32 + matrix.m33 * matrix.m33);

    var rX = Math.atan2(-matrix.m32 / sZ, matrix.m33 / sZ) * (180 / Math.PI),
        rY = Math.asin(matrix.m31 / sZ) * (180 / Math.PI),
        rZ = Math.atan2(-matrix.m21 / sY, matrix.m11 / sX) * (180 / Math.PI);

    setRot({
      x:rX, y:rY, z:rZ
    })
    var rotateParam = ''
    
    rotateParam += 'rotate' + 'X' + '(' + rX + 'deg)';
    rotateParam += 'rotate' + 'Y' + '(' + rY + 'deg)';
    rotateParam += 'rotate' + 'Z' + '(' + rZ + 'deg)';
    cube.style.transform = rotateParam
    setDrag(true)
  }

  
  const handleEnter = (e) => {
        
    const cube = document.querySelector("#mainCube");
    const cubestyle = window.getComputedStyle(cube);
    const matrix = new DOMMatrix(cubestyle.transform);
    const matrix3d = `matrix3d(${matrix.m11}, ${matrix.m12}, ${matrix.m13}, ${matrix.m14}, 
                               ${matrix.m21}, ${matrix.m22}, ${matrix.m23}, ${matrix.m24}, 
                               ${matrix.m31}, ${matrix.m32}, ${matrix.m33}, ${matrix.m34}, 
                               ${matrix.m41}, ${matrix.m42}, ${matrix.m43}, ${matrix.m44})`;

    cube.classList.remove("cubeAnimation");
  
    cube.style.transform = matrix3d;
  };




  const handledrag = (e) =>{  
      const cube = document.querySelector("#mainCube");
      
      if(dragging){
        const deltaX = e.pageX - delta.x; // Calculate change in x
        const deltaY = e.pageY - delta.y; 
        const newrotZ = rot.z+deltaX*2.5;
        const newrotX = rot.x+deltaY*2.5;
        let rotateParam = '';
        
        
        rotateParam += 'rotate' + 'X' + '(' + newrotX + 'deg)';
        rotateParam += 'rotate' + 'Y' + '(' + rot.y + 'deg)';       
        rotateParam += 'rotate' + 'Z' + '(' + newrotZ + 'deg)';
        cube.style.transform = rotateParam
        setRot({
          x:newrotX, y:rot.y, z:newrotZ
        })
        setDelta({
          x: e.pageX,
          y: e.pageY
      });
      }
  }
  
  const handleUp = (e) => {
    setDrag(false)
  }

  const handleExit = (e) => {
    const cube = document.querySelector("#mainCube");
    cube.classList.add("cubeAnimation")
  }
  var cubieSticker = recommendClicked? 'cubie-sticker-after': 'cubie-sticker'

  const handleAddToFavorite = () =>{
      setShowAddToFavorite(!showAddToFavorite)
      if(showAddToFavorite==true){
        setCurrAnime(null)
      }
  }

  const handleRecClick = (anime) =>{
    setCurrAnime(anime)
    setShowAddToFavorite(true)
  }

  const handleShowFavs = () =>{
    setShowFavorite(!showFavorite)
    setTimeout(()=>{
      if(!showFavorite) window.scrollTo(0, document.body.scrollHeight);
    }, 500)
  }
  
  return(
    <div>
      <div style={{'alignItems': 'center', 'display': 'flex'}}>
          <div className="scene">
            {recommendClicked?<div className='loading'>
              Compiling
            </div>:null}
            <div className="cube cubeAnimation"
              id="mainCube"
              onMouseDown={handleDown}
              onMouseUp={handleUp}
              onMouseMove={handledrag}
              onMouseEnter={handleEnter}
              onMouseLeave={handleExit}>
              <div className="cube-layer">
                <div className="cubie cubie-corner-position-0">
                  <div className="cubie cubie-corner-orientation-0">
                    <div className={`cubie-face face-u ${cubieSticker}`} style={{"--rotate":"0deg"}}onClick={()=>posts.isFetched && handleRecClick(posts.data[0])}>{ posts.isFetched && (<div style={{width:"100px", height:"100px", backgroundImage: `url(${posts.data[0].image_url??posts.data[0].image_url})`, backgroundSize: "contain", backgroundPosition: "center",backgroundRepeat: "repeat", "display":imageView}}> <div className="overlayText">{posts.data[0].title_english ?? posts.data[0].title_romanji}</div></div>)}</div>
                    <div className={`cubie-face face-f ${cubieSticker}`} style={{"--rotate":"0deg"}}onClick={()=>posts.isFetched && handleRecClick(posts.data[1])}>{ posts.isFetched && (<div style={{width:"100px", height:"100px", backgroundImage: `url(${posts.data[1].image_url??posts.data[1].image_url})`, backgroundSize: "contain", backgroundPosition: "center",backgroundRepeat: "repeat", "display":imageView}}> <div className="overlayText">{posts.data[1].title_english ?? posts.data[1].title_romanji}</div></div>)}</div>
                    <div className={`cubie-face face-r ${cubieSticker}`} style={{"--rotate":"0deg"}}onClick={()=>posts.isFetched && handleRecClick(posts.data[2])}>{ posts.isFetched && (<div style={{width:"100px", height:"100px", backgroundImage: `url(${posts.data[2].image_url??posts.data[2].image_url})`, backgroundSize: "contain", backgroundPosition: "center",backgroundRepeat: "repeat", "display":imageView}}> <div className="overlayText">{posts.data[2].title_english ?? posts.data[2].title_romanji}</div></div>)}</div>
                    <div className="cubie-face face-l"></div>
                    <div className="cubie-face face-b"></div>
                    <div className="cubie-face face-d"></div>
                  </div>
                </div>
              </div>
              <div className="cube-layer">
                <div className="cubie cubie-corner-position-1">
                  <div className="cubie cubie-corner-orientation-0">
                    <div className={`cubie-face face-u ${cubieSticker}`} style={{"--rotate":"270deg"}}onClick={()=>posts.isFetched && handleRecClick(posts.data[3])}>{ posts.isFetched && (<div style={{width:"100px", height:"100px", backgroundImage: `url(${posts.data[3].image_url??posts.data[3].image_url})`, backgroundSize: "contain", backgroundPosition: "center",backgroundRepeat: "repeat", "display":imageView}}> <div className="overlayText">{posts.data[3].title_english ?? posts.data[3].title_romanji}</div></div>)}</div>
                    <div className={`cubie-face face-f ${cubieSticker}`} style={{"--rotate":"0deg"}}onClick={()=>posts.isFetched && handleRecClick(posts.data[4])}>{ posts.isFetched && (<div style={{width:"100px", height:"100px", backgroundImage: `url(${posts.data[4].image_url??posts.data[4].image_url})`, backgroundSize: "contain", backgroundPosition: "center",backgroundRepeat: "repeat", "display":imageView}}> <div className="overlayText">{posts.data[4].title_english ?? posts.data[4].title_romanji}</div></div>)}</div>
                    <div className={`cubie-face face-r ${cubieSticker}`} style={{"--rotate":"0deg"}}onClick={()=>posts.isFetched && handleRecClick(posts.data[5])}>{ posts.isFetched && (<div style={{width:"100px", height:"100px", backgroundImage: `url(${posts.data[5].image_url??posts.data[5].image_url})`, backgroundSize: "contain", backgroundPosition: "center",backgroundRepeat: "repeat", "display":imageView}}> <div className="overlayText">{posts.data[5].title_english ?? posts.data[5].title_romanji}</div></div>)}</div>
                    <div className="cubie-face face-l"></div>
                    <div className="cubie-face face-b"></div>
                    <div className="cubie-face face-d"></div>
                  </div>
                </div>
              </div>
              <div className="cube-layer">
                <div className="cubie cubie-corner-position-2">
                  <div className="cubie cubie-corner-orientation-0">
                    <div className={`cubie-face face-u ${cubieSticker}`} style={{"--rotate":"90deg"}}onClick={()=>posts.isFetched && handleRecClick(posts.data[6])}>{ posts.isFetched && (<div style={{width:"100px", height:"100px", backgroundImage: `url(${posts.data[6].image_url??posts.data[6].image_url})`, backgroundSize: "contain", backgroundPosition: "center",backgroundRepeat: "repeat", "display":imageView}}> <div className="overlayText">{posts.data[6].title_english ?? posts.data[6].title_romanji}</div></div>)}</div>
                    <div className={`cubie-face face-f ${cubieSticker}`} style={{"--rotate":"0deg"}}onClick={()=>posts.isFetched && handleRecClick(posts.data[7])}>{ posts.isFetched && (<div style={{width:"100px", height:"100px", backgroundImage: `url(${posts.data[7].image_url??posts.data[7].image_url})`, backgroundSize: "contain", backgroundPosition: "center",backgroundRepeat: "repeat", "display":imageView}}> <div className="overlayText">{posts.data[7].title_english ?? posts.data[7].title_romanji}</div></div>)}</div>
                    <div className={`cubie-face face-r ${cubieSticker}`} style={{"--rotate":"0deg"}}onClick={()=>posts.isFetched && handleRecClick(posts.data[8])}>{ posts.isFetched && (<div style={{width:"100px", height:"100px", backgroundImage: `url(${posts.data[8].image_url??posts.data[8].image_url})`, backgroundSize: "contain", backgroundPosition: "center",backgroundRepeat: "repeat", "display":imageView}}> <div className="overlayText">{posts.data[8].title_english ?? posts.data[8].title_romanji}</div></div>)}</div>
                    <div className="cubie-face face-l"></div>
                    <div className="cubie-face face-b"></div>
                    <div className="cubie-face face-d"></div>
                  </div>
                </div>
              </div>
              <div className="cube-layer">
                <div className="cubie cubie-corner-position-3">
                  <div className="cubie cubie-corner-orientation-0">
                    <div className={`cubie-face face-u ${cubieSticker}`} style={{"--rotate":"180deg"}}onClick={()=>posts.isFetched && handleRecClick(posts.data[9])}>{ posts.isFetched && (<div style={{width:"100px", height:"100px", backgroundImage: `url(${posts.data[9].image_url??posts.data[9].image_url})`, backgroundSize: "contain", backgroundPosition: "center",backgroundRepeat: "repeat", "display":imageView}}> <div className="overlayText">{posts.data[9].title_english ?? posts.data[9].title_romanji}</div></div>)}</div>
                    <div className={`cubie-face face-f ${cubieSticker}`} style={{"--rotate":"0deg"}}onClick={()=>posts.isFetched && handleRecClick(posts.data[10])}>{ posts.isFetched && (<div style={{width:"100px", height:"100px", backgroundImage: `url(${posts.data[10].image_url??posts.data[10].image_url})`, backgroundSize: "contain", backgroundPosition: "center",backgroundRepeat: "repeat", "display":imageView}}> <div className="overlayText">{posts.data[10].title_english ?? posts.data[10].title_romanji}</div></div>)}</div>
                    <div className={`cubie-face face-r ${cubieSticker}`} style={{"--rotate":"0deg"}}onClick={()=>posts.isFetched && handleRecClick(posts.data[11])}>{ posts.isFetched && (<div style={{width:"100px", height:"100px", backgroundImage: `url(${posts.data[11].image_url??posts.data[11].image_url})`, backgroundSize: "contain", backgroundPosition: "center",backgroundRepeat: "repeat", "display":imageView}}> <div className="overlayText">{posts.data[11].title_english ?? posts.data[11].title_romanji}</div></div>)}</div>
                    <div className="cubie-face face-l"></div>
                    <div className="cubie-face face-b"></div>
                    <div className="cubie-face face-d"></div>
                  </div>
                </div>
              </div>
              <div className="cube-layer">
                <div className="cubie cubie-corner-position-4">
                  <div className="cubie cubie-corner-orientation-0">
                    <div className={`cubie-face face-u ${cubieSticker}`} style={{"--rotate":"270deg"}}onClick={()=>posts.isFetched && handleRecClick(posts.data[12])}>{ posts.isFetched && (<div style={{width:"100px", height:"100px", backgroundImage: `url(${posts.data[12].image_url??posts.data[12].image_url})`, backgroundSize: "contain", backgroundPosition: "center",backgroundRepeat: "repeat", "display":imageView}}> <div className="overlayText">{posts.data[12].title_english ?? posts.data[12].title_romanji}</div></div>)}</div>
                    <div className={`cubie-face face-f ${cubieSticker}`} style={{"--rotate":"180deg"}}onClick={()=>posts.isFetched && handleRecClick(posts.data[13])}>{ posts.isFetched && (<div style={{width:"100px", height:"100px", backgroundImage: `url(${posts.data[13].image_url??posts.data[13].image_url})`, backgroundSize: "contain", backgroundPosition: "center",backgroundRepeat: "repeat", "display":imageView}}> <div className="overlayText">{posts.data[13].title_english ?? posts.data[13].title_romanji}</div></div>)}</div>
                    <div className={`cubie-face face-r ${cubieSticker}`} style={{"--rotate":"180deg"}}onClick={()=>posts.isFetched && handleRecClick(posts.data[14])}>{ posts.isFetched && (<div style={{width:"100px", height:"100px", backgroundImage: `url(${posts.data[14].image_url??posts.data[14].image_url})`, backgroundSize: "contain", backgroundPosition: "center",backgroundRepeat: "repeat", "display":imageView}}> <div className="overlayText">{posts.data[14].title_english ?? posts.data[14].title_romanji}</div></div>)}</div>
                    <div className="cubie-face face-l"></div>
                    <div className="cubie-face face-b"></div>
                    <div className="cubie-face face-d"></div>
                  </div>
                </div>
              </div>
              <div className="cube-layer">
                <div className="cubie cubie-corner-position-5">
                  <div className="cubie cubie-corner-orientation-0">
                    <div className={`cubie-face face-u ${cubieSticker}`} style={{"--rotate":"0deg"}}onClick={()=>posts.isFetched && handleRecClick(posts.data[15])}>{ posts.isFetched && (<div style={{width:"100px", height:"100px", backgroundImage: `url(${posts.data[15].image_url??posts.data[15].image_url})`, backgroundSize: "contain", backgroundPosition: "center",backgroundRepeat: "repeat", "display":imageView}}> <div className="overlayText">{posts.data[15].title_english ?? posts.data[15].title_romanji}</div></div>)}</div>
                    <div className={`cubie-face face-f ${cubieSticker}`} style={{"--rotate":"180deg"}}onClick={()=>posts.isFetched && handleRecClick(posts.data[16])}>{ posts.isFetched && (<div style={{width:"100px", height:"100px", backgroundImage: `url(${posts.data[16].image_url??posts.data[16].image_url})`, backgroundSize: "contain", backgroundPosition: "center",backgroundRepeat: "repeat", "display":imageView}}> <div className="overlayText">{posts.data[16].title_english ?? posts.data[16].title_romanji}</div></div>)}</div>
                    <div className={`cubie-face face-r ${cubieSticker}`} style={{"--rotate":"180deg"}}onClick={()=>posts.isFetched && handleRecClick(posts.data[17])}>{ posts.isFetched && (<div style={{width:"100px", height:"100px", backgroundImage: `url(${posts.data[17].image_url??posts.data[17].image_url})`, backgroundSize: "contain", backgroundPosition: "center",backgroundRepeat: "repeat", "display":imageView}}> <div className="overlayText">{posts.data[17].title_english ?? posts.data[17].title_romanji}</div></div>)}</div>
                    <div className="cubie-face face-l"></div>
                    <div className="cubie-face face-b"></div>
                    <div className="cubie-face face-d"></div>
                  </div>
                </div>
              </div>
              <div className="cube-layer">
                <div className="cubie cubie-corner-position-6">
                  <div className="cubie cubie-corner-orientation-0">
                    <div className={`cubie-face face-u ${cubieSticker}`} style={{"--rotate":"180deg"}}onClick={()=>posts.isFetched && handleRecClick(posts.data[18])}>{ posts.isFetched && (<div style={{width:"100px", height:"100px", backgroundImage: `url(${posts.data[18].image_url??posts.data[18].image_url})`, backgroundSize: "contain", backgroundPosition: "center",backgroundRepeat: "repeat", "display":imageView}}> <div className="overlayText">{posts.data[18].title_english ?? posts.data[18].title_romanji}</div></div>)}</div>
                    <div className={`cubie-face face-f ${cubieSticker}`} style={{"--rotate":"180deg"}}onClick={()=>posts.isFetched && handleRecClick(posts.data[19])}>{ posts.isFetched && (<div style={{width:"100px", height:"100px", backgroundImage: `url(${posts.data[19].image_url??posts.data[19].image_url})`, backgroundSize: "contain", backgroundPosition: "center",backgroundRepeat: "repeat", "display":imageView}}> <div className="overlayText">{posts.data[19].title_english ?? posts.data[19].title_romanji}</div></div>)}</div>
                    <div className={`cubie-face face-r ${cubieSticker}`} style={{"--rotate":"180deg"}}onClick={()=>posts.isFetched && handleRecClick(posts.data[20])}>{ posts.isFetched && (<div style={{width:"100px", height:"100px", backgroundImage: `url(${posts.data[20].image_url??posts.data[20].image_url})`, backgroundSize: "contain", backgroundPosition: "center",backgroundRepeat: "repeat", "display":imageView}}> <div className="overlayText">{posts.data[20].title_english ?? posts.data[20].title_romanji}</div></div>)}</div>
                    <div className="cubie-face face-l"></div>
                    <div className="cubie-face face-b"></div>
                    <div className="cubie-face face-d"></div>
                  </div>
                </div>
              </div>
              <div className="cube-layer">
                <div className="cubie cubie-corner-position-7">
                  <div className="cubie cubie-corner-orientation-0">
                    <div className={`cubie-face face-u ${cubieSticker}`} style={{"--rotate":"90deg"}}onClick={()=>posts.isFetched && handleRecClick(posts.data[21])}>{ posts.isFetched && (<div style={{width:"100px", height:"100px", backgroundImage: `url(${posts.data[21].image_url??posts.data[21].image_url})`, backgroundSize: "contain", backgroundPosition: "center",backgroundRepeat: "repeat", "display":imageView}}> <div className="overlayText">{posts.data[21].title_english ?? posts.data[21].title_romanji}</div></div>)}</div>
                    <div className={`cubie-face face-f ${cubieSticker}`} style={{"--rotate":"180deg"}}onClick={()=>posts.isFetched && handleRecClick(posts.data[22])}>{ posts.isFetched && (<div style={{width:"100px", height:"100px", backgroundImage: `url(${posts.data[22].image_url??posts.data[22].image_url})`, backgroundSize: "contain", backgroundPosition: "center",backgroundRepeat: "repeat", "display":imageView}}> <div className="overlayText">{posts.data[22].title_english ?? posts.data[22].title_romanji}</div></div>)}</div>
                    <div className={`cubie-face face-r ${cubieSticker}`} style={{"--rotate":"180deg"}}onClick={()=>posts.isFetched && handleRecClick(posts.data[23])}>{ posts.isFetched && (<div style={{width:"100px", height:"100px", backgroundImage: `url(${posts.data[23].image_url??posts.data[23].image_url})`, backgroundSize: "contain", backgroundPosition: "center",backgroundRepeat: "repeat", "display":imageView}}> <div className="overlayText">{posts.data[23].title_english ?? posts.data[23].title_romanji}</div></div>)}</div>
                    <div className="cubie-face face-l"></div>
                    <div className="cubie-face face-b"></div>
                    <div className="cubie-face face-d"></div>
                  </div>
                </div>
              </div>
      
              <div className="cube-layer">
                <div className="cubie cubie-edge-position-0">
                  <div className="cubie cubie-edge-orientation-0">
                    <div className={`cubie-face face-u ${cubieSticker}`} style={{"--rotate":"0deg"}}onClick={()=>posts.isFetched && handleRecClick(posts.data[24])}>{ posts.isFetched && (<div style={{width:"100px", height:"100px", backgroundImage: `url(${posts.data[24].image_url??posts.data[24].image_url})`, backgroundSize: "contain", backgroundPosition: "center",backgroundRepeat: "repeat", "display":imageView}}> <div className="overlayText">{posts.data[24].title_english ?? posts.data[24].title_romanji}</div></div>)}</div>
                    <div className={`cubie-face face-f ${cubieSticker}`} style={{"--rotate":"0deg"}}onClick={()=>posts.isFetched && handleRecClick(posts.data[25])}>{ posts.isFetched && (<div style={{width:"100px", height:"100px", backgroundImage: `url(${posts.data[25].image_url??posts.data[25].image_url})`, backgroundSize: "contain", backgroundPosition: "center",backgroundRepeat: "repeat", "display":imageView}}> <div className="overlayText">{posts.data[25].title_english ?? posts.data[25].title_romanji}</div></div>)}</div>
                    <div className="cubie-face face-r"></div>
                    <div className="cubie-face face-l"></div>
                    <div className="cubie-face face-b"></div>
                    <div className="cubie-face face-d"></div>
                  </div>
                </div>
              </div>
              <div className="cube-layer">
                <div className="cubie cubie-edge-position-1">
                  <div className="cubie cubie-edge-orientation-0">
                    <div className={`cubie-face face-u ${cubieSticker}`} style={{"--rotate":"-90deg"}}onClick={()=>posts.isFetched && handleRecClick(posts.data[26])}>{ posts.isFetched && (<div style={{width:"100px", height:"100px", backgroundImage: `url(${posts.data[26].image_url??posts.data[26].image_url})`, backgroundSize: "contain", backgroundPosition: "center",backgroundRepeat: "repeat", "display":imageView}}> <div className="overlayText">{posts.data[26].title_english ?? posts.data[26].title_romanji}</div></div>)}</div>
                    <div className={`cubie-face face-f ${cubieSticker}`} style={{"--rotate":"0deg"}}onClick={()=>posts.isFetched && handleRecClick(posts.data[27])}>{ posts.isFetched && (<div style={{width:"100px", height:"100px", backgroundImage: `url(${posts.data[27].image_url??posts.data[27].image_url})`, backgroundSize: "contain", backgroundPosition: "center",backgroundRepeat: "repeat", "display":imageView}}> <div className="overlayText">{posts.data[27].title_english ?? posts.data[27].title_romanji}</div></div>)}</div>
                    <div className="cubie-face face-r"></div>
                    <div className="cubie-face face-l"></div>
                    <div className="cubie-face face-b"></div>
                    <div className="cubie-face face-d"></div>
                  </div>
                </div>
              </div>
              <div className="cube-layer">
                <div className="cubie cubie-edge-position-2">
                  <div className="cubie cubie-edge-orientation-0">
                    <div className={`cubie-face face-u ${cubieSticker}`} style={{"--rotate":"90deg"}}onClick={()=>posts.isFetched && handleRecClick(posts.data[28])}>{ posts.isFetched && (<div style={{width:"100px", height:"100px", backgroundImage: `url(${posts.data[28].image_url??posts.data[28].image_url})`, backgroundSize: "contain", backgroundPosition: "center",backgroundRepeat: "repeat", "display":imageView}}> <div className="overlayText">{posts.data[28].title_english ?? posts.data[28].title_romanji}</div></div>)}</div>
                    <div className={`cubie-face face-f ${cubieSticker}`} style={{"--rotate":"0deg"}}onClick={()=>posts.isFetched && handleRecClick(posts.data[29])}>{ posts.isFetched && (<div style={{width:"100px", height:"100px", backgroundImage: `url(${posts.data[29].image_url??posts.data[29].image_url})`, backgroundSize: "contain", backgroundPosition: "center",backgroundRepeat: "repeat", "display":imageView}}> <div className="overlayText">{posts.data[29].title_english ?? posts.data[29].title_romanji}</div></div>)}</div>
                    <div className="cubie-face face-r"></div>
                    <div className="cubie-face face-l"></div>
                    <div className="cubie-face face-b"></div>
                    <div className="cubie-face face-d"></div>
                  </div>
                </div>
              </div>
              <div className="cube-layer">
                <div className="cubie cubie-edge-position-3">
                  <div className="cubie cubie-edge-orientation-0">
                    <div className={`cubie-face face-u ${cubieSticker}`} style={{"--rotate":"180deg"}}onClick={()=>posts.isFetched && handleRecClick(posts.data[30])}>{ posts.isFetched && (<div style={{width:"100px", height:"100px", backgroundImage: `url(${posts.data[30].image_url??posts.data[30].image_url})`, backgroundSize: "contain", backgroundPosition: "center",backgroundRepeat: "repeat", "display":imageView}}> <div className="overlayText">{posts.data[30].title_english ?? posts.data[30].title_romanji}</div></div>)}</div>
                    <div className={`cubie-face face-f ${cubieSticker}`} style={{"--rotate":"0deg"}}onClick={()=>posts.isFetched && handleRecClick(posts.data[31])}>{ posts.isFetched && (<div style={{width:"100px", height:"100px", backgroundImage: `url(${posts.data[31].image_url??posts.data[31].image_url})`, backgroundSize: "contain", backgroundPosition: "center",backgroundRepeat: "repeat", "display":imageView}}> <div className="overlayText">{posts.data[31].title_english ?? posts.data[31].title_romanji}</div></div>)}</div>
                    <div className="cubie-face face-r"></div>
                    <div className="cubie-face face-l"></div>
                    <div className="cubie-face face-b"></div>
                    <div className="cubie-face face-d"></div>
                  </div>
                </div>
              </div>
      
              <div className="cube-layer">
                <div className="cubie cubie-edge-position-4">
                  <div className="cubie cubie-edge-orientation-0">
                    <div className={`cubie-face face-u ${cubieSticker}`} style={{"--rotate":"0deg"}}onClick={()=>posts.isFetched && handleRecClick(posts.data[32])}>{ posts.isFetched && (<div style={{width:"100px", height:"100px", backgroundImage: `url(${posts.data[32].image_url??posts.data[32].image_url})`, backgroundSize: "contain", backgroundPosition: "center",backgroundRepeat: "repeat", "display":imageView}}> <div className="overlayText">{posts.data[32].title_english ?? posts.data[32].title_romanji}</div></div>)}</div>
                    <div className={`cubie-face face-f ${cubieSticker}`} style={{"--rotate":"180deg"}}onClick={()=>posts.isFetched && handleRecClick(posts.data[33])}>{ posts.isFetched && (<div style={{width:"100px", height:"100px", backgroundImage: `url(${posts.data[33].image_url??posts.data[33].image_url})`, backgroundSize: "contain", backgroundPosition: "center",backgroundRepeat: "repeat", "display":imageView}}> <div className="overlayText">{posts.data[33].title_english ?? posts.data[33].title_romanji}</div></div>)}</div>
                    <div className="cubie-face face-r"></div>
                    <div className="cubie-face face-l"></div>
                    <div className="cubie-face face-b"></div>
                    <div className="cubie-face face-d"></div>
                  </div>
                </div>
              </div>
              <div className="cube-layer">
                <div className="cubie cubie-edge-position-5">
                  <div className="cubie cubie-edge-orientation-0">
                    <div className={`cubie-face face-u ${cubieSticker}`} style={{"--rotate":"90deg"}}onClick={()=>posts.isFetched && handleRecClick(posts.data[34])}>{ posts.isFetched && (<div style={{width:"100px", height:"100px", backgroundImage: `url(${posts.data[34].image_url??posts.data[34].image_url})`, backgroundSize: "contain", backgroundPosition: "center",backgroundRepeat: "repeat", "display":imageView}}> <div className="overlayText">{posts.data[34].title_english ?? posts.data[34].title_romanji}</div></div>)}</div>
                    <div className={`cubie-face face-f ${cubieSticker}`} style={{"--rotate":"180deg"}}onClick={()=>posts.isFetched && handleRecClick(posts.data[35])}>{ posts.isFetched && (<div style={{width:"100px", height:"100px", backgroundImage: `url(${posts.data[35].image_url??posts.data[35].image_url})`, backgroundSize: "contain", backgroundPosition: "center",backgroundRepeat: "repeat", "display":imageView}}> <div className="overlayText">{posts.data[35].title_english ?? posts.data[35].title_romanji}</div></div>)}</div>
                    <div className="cubie-face face-r"></div>
                    <div className="cubie-face face-l"></div>
                    <div className="cubie-face face-b"></div>
                    <div className="cubie-face face-d"></div>
                  </div>
                </div>
              </div>
              <div className="cube-layer">
                <div className="cubie cubie-edge-position-6">
                  <div className="cubie cubie-edge-orientation-0">
                    <div className={`cubie-face face-u ${cubieSticker}`} style={{"--rotate":"270deg"}}onClick={()=>posts.isFetched && handleRecClick(posts.data[36])}>{ posts.isFetched && (<div style={{width:"100px", height:"100px", backgroundImage: `url(${posts.data[36].image_url??posts.data[36].image_url})`, backgroundSize: "contain", backgroundPosition: "center",backgroundRepeat: "repeat", "display":imageView}}> <div className="overlayText">{posts.data[36].title_english ?? posts.data[36].title_romanji}</div></div>)}</div>
                    <div className={`cubie-face face-f ${cubieSticker}`} style={{"--rotate":"180deg"}}onClick={()=>posts.isFetched && handleRecClick(posts.data[37])}>{ posts.isFetched && (<div style={{width:"100px", height:"100px", backgroundImage: `url(${posts.data[37].image_url??posts.data[37].image_url})`, backgroundSize: "contain", backgroundPosition: "center",backgroundRepeat: "repeat", "display":imageView}}> <div className="overlayText">{posts.data[37].title_english ?? posts.data[37].title_romanji}</div></div>)}</div>
                    <div className="cubie-face face-r"></div>
                    <div className="cubie-face face-l"></div>
                    <div className="cubie-face face-b"></div>
                    <div className="cubie-face face-d"></div>
                  </div>
                </div>
              </div>
              <div className="cube-layer">
                <div className="cubie cubie-edge-position-7">
                  <div className="cubie cubie-edge-orientation-0">
                    <div className={`cubie-face face-u ${cubieSticker}`} style={{"--rotate":"180deg"}}onClick={()=>posts.isFetched && handleRecClick(posts.data[38])}>{ posts.isFetched && (<div style={{width:"100px", height:"100px", backgroundImage: `url(${posts.data[38].image_url??posts.data[38].image_url})`, backgroundSize: "contain", backgroundPosition: "center",backgroundRepeat: "repeat", "display":imageView}}> <div className="overlayText">{posts.data[38].title_english ?? posts.data[38].title_romanji}</div></div>)}</div>
                    <div className={`cubie-face face-f ${cubieSticker}`} style={{"--rotate":"180deg"}}onClick={()=>posts.isFetched && handleRecClick(posts.data[39])}>{ posts.isFetched && (<div style={{width:"100px", height:"100px", backgroundImage: `url(${posts.data[39].image_url??posts.data[39].image_url})`, backgroundSize: "contain", backgroundPosition: "center",backgroundRepeat: "repeat", "display":imageView}}> <div className="overlayText">{posts.data[39].title_english ?? posts.data[39].title_romanji}</div></div>)}</div>
                    <div className="cubie-face face-r"></div>
                    <div className="cubie-face face-l"></div>
                    <div className="cubie-face face-b"></div>
                    <div className="cubie-face face-d"></div>
                  </div>
                </div>
              </div>
      
              <div className="cube-layer">
                <div className="cubie cubie-edge-position-8">
                  <div className="cubie cubie-edge-orientation-0">
                    <div className={`cubie-face face-u ${cubieSticker}`} style={{"--rotate":"90deg"}}onClick={()=>posts.isFetched && handleRecClick(posts.data[40])}>{ posts.isFetched && (<div style={{width:"100px", height:"100px", backgroundImage: `url(${posts.data[40].image_url??posts.data[40].image_url})`, backgroundSize: "contain", backgroundPosition: "center",backgroundRepeat: "repeat", "display":imageView}}> <div className="overlayText">{posts.data[40].title_english ?? posts.data[40].title_romanji}</div></div>)}</div>
                    <div className={`cubie-face face-f ${cubieSticker}`} style={{"--rotate":"90deg"}}onClick={()=>posts.isFetched && handleRecClick(posts.data[41])}>{ posts.isFetched && (<div style={{width:"100px", height:"100px", backgroundImage: `url(${posts.data[41].image_url??posts.data[41].image_url})`, backgroundSize: "contain", backgroundPosition: "center",backgroundRepeat: "repeat", "display":imageView}}> <div className="overlayText">{posts.data[41].title_english ?? posts.data[41].title_romanji}</div></div>)}</div>
                    <div className="cubie-face face-r"></div>
                    <div className="cubie-face face-l"></div>
                    <div className="cubie-face face-b"></div>
                    <div className="cubie-face face-d"></div>
                  </div>
                </div>
              </div>
              <div className="cube-layer">
                <div className="cubie cubie-edge-position-9">
                  <div className="cubie cubie-edge-orientation-0">
                    <div className={`cubie-face face-u ${cubieSticker}`} style={{"--rotate":"-90deg"}}onClick={()=>posts.isFetched && handleRecClick(posts.data[42])}>{ posts.isFetched && (<div style={{width:"100px", height:"100px", backgroundImage: `url(${posts.data[42].image_url??posts.data[42].image_url})`, backgroundSize: "contain", backgroundPosition: "center",backgroundRepeat: "repeat", "display":imageView}}> <div className="overlayText">{posts.data[42].title_english ?? posts.data[42].title_romanji}</div></div>)}</div>
                    <div className={`cubie-face face-f ${cubieSticker}`} style={{"--rotate":"-90deg"}}onClick={()=>posts.isFetched && handleRecClick(posts.data[43])}>{ posts.isFetched && (<div style={{width:"100px", height:"100px", backgroundImage: `url(${posts.data[43].image_url??posts.data[43].image_url})`, backgroundSize: "contain", backgroundPosition: "center",backgroundRepeat: "repeat", "display":imageView}}> <div className="overlayText">{posts.data[43].title_english ?? posts.data[43].title_romanji}</div></div>)}</div>
                    <div className="cubie-face face-r"></div>
                    <div className="cubie-face face-l"></div>
                    <div className="cubie-face face-b"></div>
                    <div className="cubie-face face-d"></div>
                  </div>
                </div>
              </div>
              <div className="cube-layer">
                <div className="cubie cubie-edge-position-10">
                  <div className="cubie cubie-edge-orientation-0">
                    <div className={`cubie-face face-u ${cubieSticker}`} style={{"--rotate":"-90deg"}}onClick={()=>posts.isFetched && handleRecClick(posts.data[44])}>{ posts.isFetched && (<div style={{width:"100px", height:"100px", backgroundImage: `url(${posts.data[44].image_url??posts.data[44].image_url})`, backgroundSize: "contain", backgroundPosition: "center",backgroundRepeat: "repeat", "display":imageView}}> <div className="overlayText">{posts.data[44].title_english ?? posts.data[44].title_romanji}</div></div>)}</div>
                    <div className={`cubie-face face-f ${cubieSticker}`} style={{"--rotate":"-90deg"}}onClick={()=>posts.isFetched && handleRecClick(posts.data[45])}>{ posts.isFetched && (<div style={{width:"100px", height:"100px", backgroundImage: `url(${posts.data[45].image_url??posts.data[45].image_url})`, backgroundSize: "contain", backgroundPosition: "center",backgroundRepeat: "repeat", "display":imageView}}> <div className="overlayText">{posts.data[45].title_english ?? posts.data[45].title_romanji}</div></div>)}</div>
                    <div className="cubie-face face-r"></div>
                    <div className="cubie-face face-l"></div>
                    <div className="cubie-face face-b"></div>
                    <div className="cubie-face face-d"></div>
                  </div>
                </div>
              </div>
              <div className="cube-layer">
                <div className="cubie cubie-edge-position-11">
                  <div className="cubie cubie-edge-orientation-0">
                    <div className={`cubie-face face-u ${cubieSticker}`} style={{"--rotate":"90deg"}}onClick={()=>posts.isFetched && handleRecClick(posts.data[46])}>{ posts.isFetched && (<div style={{width:"100px", height:"100px", backgroundImage: `url(${posts.data[46].image_url??posts.data[46].image_url})`, backgroundSize: "contain", backgroundPosition: "center",backgroundRepeat: "repeat", "display":imageView}}> <div className="overlayText">{posts.data[46].title_english ?? posts.data[46].title_romanji}</div></div>)}</div>
                    <div className={`cubie-face face-f ${cubieSticker}`} style={{"--rotate":"90deg"}}onClick={()=>posts.isFetched && handleRecClick(posts.data[47])}>{ posts.isFetched && (<div style={{width:"100px", height:"100px", backgroundImage: `url(${posts.data[47].image_url??posts.data[47].image_url})`, backgroundSize: "contain", backgroundPosition: "center",backgroundRepeat: "repeat", "display":imageView}}> <div className="overlayText">{posts.data[47].title_english ?? posts.data[47].title_romanji}</div></div>)}</div>
                    <div className="cubie-face face-r"></div>
                    <div className="cubie-face face-l"></div>
                    <div className="cubie-face face-b"></div>
                    <div className="cubie-face face-d"></div>
                  </div>
                </div>
              </div>
      
              <div className="cube-layer">
                <div className="cubie cubie-middle-r">
                  <div className={`cubie-face face-r ${cubieSticker}`} style={{"--rotate":"0deg"}}onClick={()=>posts.isFetched && handleRecClick(posts.data[48])}>{ posts.isFetched && (<div style={{width:"100px", height:"100px", backgroundImage: `url(${posts.data[48].image_url??posts.data[48].image_url})`, backgroundSize: "contain", backgroundPosition: "center",backgroundRepeat: "repeat", "display":imageView}}> <div className="overlayText">{posts.data[48].title_english ?? posts.data[48].title_romanji}</div></div>)}</div>
                  <div className="cubie-face face-l"></div>
                  <div className="cubie-face face-f"></div>
                  <div className="cubie-face face-b"></div>
                  <div className="cubie-face face-u"></div>
                  <div className="cubie-face face-d"></div>
                </div>
              </div>
              <div className="cube-layer">
                <div className="cubie cubie-middle-l">
                  <div className="cubie-face face-r"></div>
                  <div className={`cubie-face face-l ${cubieSticker}`} style={{"--rotate":"0deg"}}onClick={()=>posts.isFetched && handleRecClick(posts.data[49])}>{ posts.isFetched && (<div style={{width:"100px", height:"100px", backgroundImage: `url(${posts.data[49].image_url??posts.data[49].image_url})`, backgroundSize: "contain", backgroundPosition: "center",backgroundRepeat: "repeat", "display":imageView}}> <div className="overlayText">{posts.data[49].title_english ?? posts.data[49].title_romanji}</div></div>)}</div>
                  <div className="cubie-face face-f"></div>
                  <div className="cubie-face face-b"></div>
                  <div className="cubie-face face-u"></div>
                  <div className="cubie-face face-d"></div>
                </div>
              </div>
              <div className="cube-layer">
                <div className="cubie cubie-middle-f">
                  <div className="cubie-face face-r"></div>
                  <div className="cubie-face face-l"></div>
                  <div className={`cubie-face face-f ${cubieSticker}`} style={{"--rotate":"0deg"}}onClick={()=>posts.isFetched && handleRecClick(posts.data[50])}>{ posts.isFetched && (<div style={{width:"100px", height:"100px", backgroundImage: `url(${posts.data[50].image_url??posts.data[50].image_url})`, backgroundSize: "contain", backgroundPosition: "center",backgroundRepeat: "repeat", "display":imageView}}> <div className="overlayText">{posts.data[50].title_english ?? posts.data[50].title_romanji}</div></div>)}</div>
                  <div className="cubie-face face-b"></div>
                  <div className="cubie-face face-u"></div>
                  <div className="cubie-face face-d"></div>
                </div>
              </div>
              <div className="cube-layer">
                <div className="cubie cubie-middle-b">
                  <div className="cubie-face face-r"></div>
                  <div className="cubie-face face-l"></div>
                  <div className="cubie-face face-f"></div>
                  <div className={`cubie-face face-b ${cubieSticker}`} style={{"--rotate":"0deg"}}onClick={()=>posts.isFetched && handleRecClick(posts.data[51])}>{ posts.isFetched && (<div style={{width:"100px", height:"100px", backgroundImage: `url(${posts.data[51].image_url??posts.data[51].image_url})`, backgroundSize: "contain", backgroundPosition: "center",backgroundRepeat: "repeat", "display":imageView}}> <div className="overlayText">{posts.data[51].title_english ?? posts.data[51].title_romanji}</div></div>)}</div>
                  <div className="cubie-face face-u"></div>
                  <div className="cubie-face face-d"></div>
                </div>
              </div>
              <div className="cube-layer">
                <div className="cubie cubie-middle-u">
                  <div className="cubie-face face-r"></div>
                  <div className="cubie-face face-l"></div>
                  <div className="cubie-face face-f"></div>
                  <div className="cubie-face face-b"></div>
                  <div className={`cubie-face face-u ${cubieSticker}`} style={{"--rotate":"0deg"}}onClick={()=>posts.isFetched && handleRecClick(posts.data[52])}>{ posts.isFetched && (<div style={{width:"100px", height:"100px", backgroundImage: `url(${posts.data[52].image_url??posts.data[52].image_url})`, backgroundSize: "contain", backgroundPosition: "center",backgroundRepeat: "repeat", "display":imageView}}> <div className="overlayText">{posts.data[52].title_english ?? posts.data[52].title_romanji}</div></div>)}</div>
                  <div className="cubie-face face-d"></div>
                </div>
              </div>
              <div className="cube-layer">
                <div className="cubie cubie-middle-d">
                  <div className="cubie-face face-r"></div>
                  <div className="cubie-face face-l"></div>
                  <div className="cubie-face face-f"></div>
                  <div className="cubie-face face-b"></div>
                  <div className="cubie-face face-u"></div>
                  <div className={`cubie-face face-d ${cubieSticker}`} style={{"--rotate":"180deg"}}onClick={()=>posts.isFetched && handleRecClick(posts.data[53])}>{ posts.isFetched && (<div style={{width:"100px", height:"100px", backgroundImage: `url(${posts.data[53].image_url??posts.data[53].image_url})`, backgroundSize: "contain", backgroundPosition: "center",backgroundRepeat: "repeat", "display":imageView}}> <div className="overlayText">{posts.data[53].title_english ?? posts.data[53].title_romanji}</div></div>)}</div>
                </div>
              </div>
            </div>
          </div>
          <div style={{display:"flex", alignItems:"center", flexFlow:"column"}}>
            
              <button onClick={() => handleOnClick({setRecommendClicked, "refetch": posts.refetch})}>Recommend</button>
              <button onClick={handleShowFavs}>{showFavorite? "Hide Favourite": "Show Favourite"}</button>
              <button  onClick={handleAddToFavorite}>{showAddToFavorite? "Go Back": "Add to Favourite"}</button>
            {showAddToFavorite &&  <AnimeList currAnime={currAnime} setCurrAnime={setCurrAnime} user={user} setMessage={setMessage}/>}
          </div>
        </div>
        {showFavorite && <Favorites setCurrAnime={setCurrAnime} setShowAddToFavorite={setShowAddToFavorite}/>}
    </div>
    )
}

export default Cube