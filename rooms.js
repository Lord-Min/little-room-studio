const roomPresets = {
  small: {name:'작은 방', width:2400, depth:2800, rightDoor:false},
  large: {name:'큰 방', width:4000, depth:3600, rightDoor:true}
};
const roomId = new URLSearchParams(location.search).get('room') === 'large' ? 'large' : 'small';
const room = roomPresets[roomId];
