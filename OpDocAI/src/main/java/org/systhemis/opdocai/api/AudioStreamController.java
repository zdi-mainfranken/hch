package org.systhemis.opdocai.api;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.socket.server.standard.ServerEndpointExporter;
import org.springframework.web.socket.server.standard.ServletServerContainerFactoryBean;
import org.systhemis.opdocai.api.handler.BinaryAudioWebSocketHandler;

@Configuration
@EnableWebSocket
public class AudioStreamController implements WebSocketConfigurer {

  @Override
  public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
    registry.addHandler(new BinaryAudioWebSocketHandler(), "/api/audio-stream").setAllowedOriginPatterns("*").withSockJS();
  }

  @Bean
  public ServerEndpointExporter serverEndpointExporter() {
    return new ServerEndpointExporter();
  }

  @Bean
  public ServletServerContainerFactoryBean container() {
    ServletServerContainerFactoryBean factoryBean = new ServletServerContainerFactoryBean();
    factoryBean.setMaxBinaryMessageBufferSize(1024 * 1024); // Set the maximum buffer size
    return factoryBean;
  }
}
