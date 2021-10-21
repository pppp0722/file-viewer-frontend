import React, {useState,useEffect} from 'react';
import styled from 'styled-components';
import axios from 'axios';

import imageBackground from '../images/image_background.PNG';
import PlayButton from '../images/play.png';
import Detail from './Detail';
import Other from './Other';

import { useSelector } from 'react-redux';

// 썸네일의 경우 레이아웃을 위해 너비 200px, 높이 100px로 한 열에 5개씩 들어감
const Thumbnail = (props) => {
    // 처음 썸네일 이미지를 로드하고 blob url을 적재하기 위한 useState
    const [image, setImage] = useState();

    // Detail에 전달할 파일의 정보 Array
    // 0: blob url, 1: isVideo(boolean) 2: fileName
    const [fileInfo, setFileInfo] = useState();

    // Detail을 킬 것인지 boolean 값
    const [detail, setDetail] = useState(false);

    // image인지 아닌지
    const [suitable, setSuitable] = useState(true);

    const [otherDetail, setOtherDetail] = useState();

    const Wrapper = styled.div`
        display: flex;
        margin: 16px 16px 16px 16px;
        cursor: pointer;

    `
    const Div = styled.div`
        background-image: url(${props => props.bgImage});
        background-repeat: round;
        width: 133px;
        height: 133px;
    `
    const Img = styled.img`
        width: 133px;
        height: 133px;
        position: absolute;
    `

    const Play = styled.img`
        position: absolute;
        width: 40px;
        height: 40px;
        margin: 46px 46px 0 46px;
    `
    
    const OtherDiv = styled.div`
        width: 133px;
        height: 133px;
        word-break: break-all;
        display: table;
        background-color: #FFB0A0;
    `

    const OtherText = styled.div`
        display: table-cell;
        vertical-align: middle;
        text-align: center;
    `

    const {url} = useSelector(state => state.url);

    // 컴포넌트에 들어갈 이미지를 Spring에 요청해서 받아옴
    useEffect(()=> {
        // Spring에 "메뉴/파일이름" 을 message로 get 요청
        axios.get(`${url}/api/getsource?message=${props.menu}/${props.fileName}`, {responseType: 'arraybuffer'})
        .then((response) => {
            let contentType = response.headers['content-type'].split("/")[0];
            if(contentType !== 'image') setSuitable(false);
            // response로 file data 받음
            // src에 넣을 blob 생성
            let blob = new Blob(
                [response.data],
                {type: response.headers['content-type']}
            );
            let img = URL.createObjectURL(blob);

            // Detail에 url 전달하기 위한 목적으로 useState에 넣어줌
            setImage(img);
        }).catch((error) => {
            console.log(error);
        });
        return () => {
            URL.revokeObjectURL(image);
        };
    },[]);

    const thumbnailClick = () => {
        if(suitable){
            let selected = [];
            // 영상인 경우
            // Ex) "a/b@mp4.png" => "a/b.mp4" 로 변경하기 위한 로직
            if(props.fileName.indexOf("@") !== -1){
                // a/b@mp4.png => "a/b" / "mp4.png"
                const splited1 = props.fileName.split("@");
                // "mp4.png" => "mp4" / "png"
                const splited2 = splited1[1].split(".");
                // "example" + "." + "mp4"
                const fileName = splited1[0] + "." + splited2[0];
                
                // 해당 썸네일에 맞는 영상을 Spring에 요청하여 받아옴 (썸네일은 단순 png)
                axios.get(`${url}/api/getsource?message=${props.menu}/${fileName}`, {responseType: 'arraybuffer'})
                .then((response) => {
                    const blob = new Blob(
                        [response.data],
                        {type: response.headers['content-type']}
                    );
                    const video = URL.createObjectURL(blob);

                    // blob정보, 동영상인지, 파일 이름을 넣어 줌
                    selected.push(video);
                    selected.push(true);
                    selected.push(fileName);

                    // Detail에 보낼 배열을 useState에 넣고 detail창을 true로 해줌
                    setFileInfo(selected); // state에 선택한 url 넣어주기
                    setDetail(true); // state에 디테일 뷰 띄우기 true로
                }).catch((error) => {
                    console.log(error);
                });
            }
            else{
                // 동영상이 아닌 경우, 기존의 useState에 넣어 놓은 blob url 넣어주고, 동영상인지 false 넣어주고, 파일 이름 넣어줌
                selected.push(image);
                selected.push(false);
                selected.push(props.fileName);

                // Detail에 보낼 배열을 useState에 넣고 detail창을 true로 해줌
                setFileInfo(selected);
                setDetail(true); 
            }
        }else{
            axios.get(`${url}/api/getsource?message=${props.menu}/${props.fileName}`, {responseType: 'arraybuffer'})
            .then((response) => {
                const blob = new Blob(
                    [response.data],
                    {type: response.headers['content-type']}
                );
                const video = URL.createObjectURL(blob);

                setFileInfo(video); // state에 선택한 url 넣어주기
                setOtherDetail(true); // state에 디테일 뷰 띄우기 true로
            }).catch((error) => {
                console.log(error);
            });
        }
    };
    
    // 동영상 썸네일이면 Play 버튼 넣어줌
    return(
        <Wrapper>
            {suitable ?
            <Div bgImage = {imageBackground} onClick = {thumbnailClick}>
                <Img src = {image}/>
                {props.fileName.indexOf("@") !== -1 ? <Play src = {PlayButton}/> : ""}
            </Div> :
            <OtherDiv onClick = {thumbnailClick}><OtherText>❓{props.fileName}</OtherText></OtherDiv>}
            {detail ? <Detail menu = {props.menu} fileInfo = {fileInfo} setDetail = {setDetail}/> : null}
            {otherDetail ? <Other menu = {props.menu} fileName = {props.fileName} url = {fileInfo} setDetail = {setOtherDetail}/> : null}
        </Wrapper>
    );
}

export default Thumbnail;