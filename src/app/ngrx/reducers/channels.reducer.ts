import { createReducer, createSelector, on } from '@ngrx/store';
import { Channel } from '../../models/channel.model';
import * as ChannelAPIAction from '../actions/channel-api.actions';
 
export interface Channels {
    channels: Array<Channel>;
}

const initialState: Channels = {
    channels: []
}
 
const _channelsReducer = createReducer(
    initialState,
    on(ChannelAPIAction.fetchedChannels, (state, {channels}) => {
        return { channels };
    }),
    on(ChannelAPIAction.createdChannel, (state, {channel}) => {
        return { channels: state.channels.concat([channel]) };
    }),
    on(ChannelAPIAction.deletedChannel, (state, {channel}) => {
        let index = state.channels.findIndex(x => x._id === channel._id);
        let channels = state.channels
        let firstHalf = channels.slice(0, index);
        let secondHalf = channels.slice(index + 1);
        return { channels: firstHalf.concat(secondHalf) };
    }),
);
 
export function channelsReducer(state, action) {
    return _channelsReducer(state, action);
}

export const selectChannels = createSelector(
    (state: Channels) => state.channels,
    (channels: Array<Channel>) => channels
);
