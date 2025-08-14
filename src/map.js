import { useEffect, useRef } from "react";
import loadKakaoMaps from "./KakaoLoader";
import getCurrentLocation from "./Location";
import "./Map.css";

const KAKAO_APP_KEY = "261b88294b81d5800071641ecc633dcb";

export default function Map() {
  const mapRef = useRef(null);
  const geocoderRef = useRef(null);
  const markerRef = useRef(null);
  const infoWindowRef = useRef(null);
  const containerRef = useRef(null);
  const centerAddrRef = useRef(null);
  const initialized = useRef(false);

useEffect(() => {
  if (initialized.current) return;
  initialized.current = true;

  // 핸들러를 변수로 보존해 두어야 cleanup에서 removeListener할 수 있어요.
  let onMapClick = null;
  let onMapIdle = null;
  let onMarkerClick = null;

  (async () => {
    getCurrentLocation(async (lat, lng) => {
      const kakao = await loadKakaoMaps(KAKAO_APP_KEY);
      const container = containerRef.current;
      if (!container) return;

      const map = new kakao.maps.Map(container, {
        center: new kakao.maps.LatLng(lat, lng),
        level: 3,
      });
      mapRef.current = map;

      geocoderRef.current = new kakao.maps.services.Geocoder();
      markerRef.current = new kakao.maps.Marker(); // 아직 지도에 붙이진 않음
      infoWindowRef.current = new kakao.maps.InfoWindow({ zIndex: 1 });

      onMarkerClick = function () {
        console.log("clicked!");
      };
      kakao.maps.event.addListener(markerRef.current, "click", onMarkerClick);

      // 초기 표시
      searchAddrFromCoords(map.getCenter(), displayCenterInfo);

      // 지도 클릭 시: 상세 주소 + 마커 이동/표시
      onMapClick = function (mouseEvent) {
        searchDetailAddrFromCoords(mouseEvent.latLng, (result, status) => {
          if (status === kakao.maps.services.Status.OK) {
            const road = result[0].road_address?.address_name;
            const jibun = result[0].address.address_name;

            let detailAddr = "";
            if (road) detailAddr += `<div>도로명주소 : ${road}</div>`;
            detailAddr += `<div>지번 주소 : ${jibun}</div>`;

            const content = `
              <div class="bAddr">
                <span class="title">법정동 주소정보</span>
                ${detailAddr}
              </div>
            `;

            // 마커 위치/표시
            markerRef.current.setPosition(mouseEvent.latLng);
            markerRef.current.setMap(map);

            infoWindowRef.current.setContent(content);
            infoWindowRef.current.open(map, markerRef.current);
          }
        });
      };
      kakao.maps.event.addListener(map, "click", onMapClick);

      // 중심 주소 갱신
      onMapIdle = function () {
        searchAddrFromCoords(map.getCenter(), displayCenterInfo);
      };
      kakao.maps.event.addListener(map, "idle", onMapIdle);
    });
  })();

  return () => {
    const kakao = window.kakao;
    if (kakao) {
      if (mapRef.current && onMapClick)
        kakao.maps.event.removeListener(mapRef.current, "click", onMapClick);
      if (mapRef.current && onMapIdle)
        kakao.maps.event.removeListener(mapRef.current, "idle", onMapIdle);
      if (markerRef.current && onMarkerClick)
        kakao.maps.event.removeListener(markerRef.current, "click", onMarkerClick);
    }

    infoWindowRef.current?.close();
    markerRef.current?.setMap(null);
    mapRef.current = null;
    geocoderRef.current = null;
    markerRef.current = null;
    infoWindowRef.current = null;
  };
}, []);


  const searchAddrFromCoords = (coords, callback) => {
    geocoderRef.current?.coord2RegionCode(
      coords.getLng(),
      coords.getLat(),
      callback
    );
  };

  const searchDetailAddrFromCoords = (coords, callback) => {
    geocoderRef.current?.coord2Address(
      coords.getLng(),
      coords.getLat(),
      callback
    );
  };

  const displayCenterInfo = (result, status) => {
    const kakao = window.kakao;
    if (status === kakao.maps.services.Status.OK) {
      const infoEl = centerAddrRef.current;
      if (!infoEl) return;
      for (let i = 0; i < result.length; i++) {
        if (result[i].region_type === "H") {
          infoEl.textContent = result[i].address_name;
          break;
        }
      }
    }
  };

  return (
    <div className="map_wrap">
      <div id="map" ref={containerRef} className="map_canvas" />
      <div className="hAddr">
        <span className="title">지도중심기준 행정동 주소정보</span>
        <span id="centerAddr" ref={centerAddrRef} />
      </div>
    </div>
  );
}
