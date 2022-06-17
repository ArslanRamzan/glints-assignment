import { EditOutlined } from '@ant-design/icons';
import { Avatar, Card, Col, Divider, Empty, Row, Spin } from "antd";
import Meta from "antd/lib/card/Meta";
import axios from "axios";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { IProfileList } from "../@types/ProfileList";

const UserProfileView: React.FC = () => {
    let history = useHistory();
    const [profileList, setProfileList] = useState<IProfileList[]>([]);
    const [loadingProfileList, setLoadingProfileList] = useState<boolean>(false);
    const [loadingMessage, setLoadingMessage] = useState<string>('');
    const [errorLoadingProfileList, setErrorLoadingProfileList] = useState<boolean>(false);

    const isNetworkConnected = () => {
        return window.navigator.onLine;
    }

    const sendofflineAPICalls = async () => {
        const locallyEditedProfilesObject : any = localStorage.getItem('OFFLINE_EDITED_PROFILES');
        const locallyEditedProfiles = JSON.parse(locallyEditedProfilesObject)
        if(locallyEditedProfilesObject && locallyEditedProfiles.length>0 && isNetworkConnected()){
            const profiles = await locallyEditedProfiles.map(async (profile :IProfileList) =>{
                try{
                    const response = await axios.patch(`https://nodejs-mongo-api-app.herokuapp.com/api/update/${profile._id}`, profile)
                    if(response){
                        localStorage.removeItem('OFFLINE_EDITED_PROFILES');
                    }
                    return response;
                }catch(e){

                }
            })

            const waitForSuccessfulAPICall = await Promise.all(profiles)
            if(waitForSuccessfulAPICall){
                setLoadingMessage('Syncing profiles in background');
                fetchListData()
            }
        }
    }

    useEffect(()=>{
        if(isNetworkConnected()){
            sendofflineAPICalls();  
            setLoadingMessage('Loading profiles');
            fetchListData();
        }else{
            let localStorageObject : any = localStorage.getItem('PROFILE_DATA');
            const listData = JSON.parse(localStorageObject)
            setProfileList(listData);
        }
    },[])
    const fetchListData = () => {
        setLoadingProfileList(true);
        localStorage.removeItem('PROFILE_DATA');
        fetch(`https://nodejs-mongo-api-app.herokuapp.com/api/getAll`)
        .then((response) => response.json())
        .then((response) => {
            onSuccess(response)
        })
        .catch(() => {
            onFailure();
        });
    };
    const onSuccess = (profileList: IProfileList[]) => {
        setLoadingProfileList(false);
        setErrorLoadingProfileList(false);
        setProfileList(profileList);
        let profileData : any = profileList 
        localStorage.removeItem("PROFILE_DATA")
        localStorage.setItem("PROFILE_DATA", JSON.stringify(profileData));
    }
    const onFailure = () => {
        setLoadingProfileList(false);
        setErrorLoadingProfileList(true);
    }
    const renderProfileData = () => {
            return <div style={{margin:'25px'}}>
                <Divider orientation="left">Profiles</Divider>
                <Row gutter={0}>

                {profileList.map(profile=>{
                    return <Col className="gutter-row" span={5} style={{margin:'15px'}}>
                            <Card
                                style={{ width: 365 }}
                                cover={
                                  <img
                                    alt="profile_image"
                                    src={profile.profile_image}
                                    height={"200px"}
                                    width={"200px"}
                                  />
                                }
                                actions={[
                                  <EditOutlined key="edit" onClick={()=> {
                                    history.push({pathname:`/user/edit/${profile._id}`, state:{ userProfile : profile}})
                                }}/>,
                                ]}
                            >
                            <div style={{fontSize:'18px', fontWeight:'bold'}}>
                                {`${profile.name}, ${profile.age}`}
                            </div>
                            <Divider></Divider>
                            {profile && profile.experiences && profile.experiences.map(experience=>{
                                    return <Meta
                                    style={{marginBottom: '15px'}}
                                    avatar={<Avatar src={experience.company_logo} />}
                                    title={<p>{experience.job_title + ' @ '+ experience.company}</p>}
                                    description={<p> {`${moment.unix(experience.start_date).format('DD MMMM YYYY')} ~ ${moment.unix(experience.end_date).format('DD MMMM YYYY')}`}<br/>{experience.job_description}</p>}
                                  />
                                })  
                            } 
                        </Card> 
                  </Col>
                })}
                </Row>
            </div>
      }
      
    const renderNoDataView = (description: string) => {
        return <div style={{marginTop:'200px'}}><Empty description={description}/></div>;
    }
    return (
        <div className="">
            {loadingProfileList && <div style={{marginTop:'40px'}}><Spin tip={loadingMessage}></Spin></div>}
            {profileList && profileList.length > 0 && renderProfileData()}
            {errorLoadingProfileList && renderNoDataView("Error fetching data. Check your internet connection")}
        </div>
    );
};

export default UserProfileView;
